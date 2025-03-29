import Bidding from '../models/bidding.model.js';
import Vehicle from '../models/vehicle.model.js';
import generateAndSendMail from '../utils/gen.mail.js';
import { processBids } from '../config/SQS.js';
import validateBiddingData from '../validation/bid.validation.js';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';

dotenv.config();
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION
});

const sqs = new AWS.SQS();

import mongoose from 'mongoose';


/*
 @description function to Add a bid to the database
*/
export const addBidController = async (req, res) => {
    
    const {carId} = req.params;
    const {
        amount, 
        startDate, 
        endDate,  
        startOdometerValue,
        endOdometerValue,
        owner, 
        status
    } = req.body;
    const { _id, username, email, firstName, lastName, city } = req.user;
    const from = { _id, username, email, firstName, lastName, city };

    if(startDate > endDate){
        return res.status(400).json({error: 'startDate cannot be greater than endDate'});
    }
    try {
        const vehicle = await Vehicle.findById(carId);
        const biddingData = {
            amount, 
            startDate, 
            endDate, 
            startOdometerValue,
            endOdometerValue,
            owner, 
            vehicle : {
                _id: vehicle._id,
                name: vehicle.name,
                company: vehicle.company,
                modelYear: vehicle.modelYear,
                price: vehicle.price,
                color: vehicle.color,
                mileage: vehicle.mileage,
                fuelType: vehicle.fuelType,
                category: vehicle.category,
                deleted: vehicle.deleted,
                status: vehicle.status,
                city: vehicle.city,
            },
            status,
            from
        }
        if(validateBiddingData(biddingData).error){
            return res.status(400).json({error: validateBiddingData(biddingData).error.details[0].message});
        }

        // use the SQS to send the bidding to the SQS queue 
        const params = {
            MessageBody: JSON.stringify(biddingData),
            QueueUrl: process.env.QUEUE_LINK
        };
      const result =   await sqs.sendMessage(params).promise();
        processBids();
        console.log(result);
        return res.status(201).json({ message:  `message bidding added successfully` });
    } catch (error) {
        console.log(`error in the addBidController ${error.message}`);
        return res.status(500).json({ error : `error in the addBidController ${error.message}` });
    }
}

/*
 @description: This function will update bids at a particular status and reject overlapping bids
*/
export const updateBidStatusController = async (req, res) => {
    const { biddingStatus } = req.body;

    if (!biddingStatus) {
        return res.status(400).json({ error: 'Bidding status is required' });
    }
    
    let session; 
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const bidding = await Bidding.findById(req.params.id).session(session);
        console.log(req.user._id.toString(), "and", bidding.owner._id.toString());

        if (req.user._id.toString() !== bidding.owner._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ error: "You are not authorized to change the status of this bid" });
        }


        if (!bidding) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: "Bidding not found" });
        }
        
        bidding.status = biddingStatus;
        await bidding.save({ session });

        if (biddingStatus === "approved") {
            const { startDate, endDate } = bidding;
            await Bidding.updateMany(
                {
                    _id: { $ne: bidding._id },
                    'vehicle._id': bidding.vehicle._id,
                    status: { $nin: ["rejected", "approved", "ended", "started", "reviewed"] }, 
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate },
                },
                { $set: { status: "rejected" } },
                { session }
            );
            generateAndSendMail({ subject: "Bidding Approved", text: `Congrats Your bid on vehicle ${bidding.vehicle.name} has been approved by the owner ${bidding.owner.username}, the bid amount is ${bidding.amount}, startDate is ${new Date(bidding.startDate).toLocaleDateString()}, endDate is ${new Date(bidding.endDate).toLocaleDateString()}` });
        }

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({ mssg: "Bidding status changed", bidding: bidding });
    } catch (err) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error(`Error in updateBidStatusController: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};
/*
 @description function to get the bids according to the search query from the request.query
*/
export const getBidForOwnerController = async (req, res) => {
    const user = req.user;
    console.log(req.query.page, req.query.limit, req.query.status);
    const {  page = 1, limit = 10, sort={}} = req.query;
    console.log(sort, page, limit);
    const status = req.query.status || 'pending';
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = {...sort, createdAt: -1};
    
    const skip = (pageNumber - 1) * limitNumber;

    try {
        const totalDocs = await Bidding.countDocuments({ "owner._id": user._id, status });
        const aggregationPipeline = [
            { $match: { "owner._id": user._id } },
            { $match: {"status": status } },
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber },
        ];

        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({
            result,
            totalDocs
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

/*
 @description function to get the bids according to the search query from the request.query
*/
export const getBidForUserController = async (req, res) => {
    console.log("req.query" ,req.query);
    let { page = 1, limit = 10, sort = {}, status="pending" } = req.query;
    console.log(status, page, limit);
    console.log("149", status);
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = { ...sort, createdAt: -1 };
    const skip = (pageNumber - 1) * limitNumber;
    
    try{
        const totalDocs = await Bidding.countDocuments({ "from._id": req.user._id, status });
        const aggregationPipeline = [
            { $match: { "from._id": req.user._id } },
            { $match: { "status": status } },
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber }
        ];
        const result = await Bidding.aggregate(aggregationPipeline);
        const bids = result
        return res.status(200).json({
            bids, 
            totalDocs
        });
    }catch(err){
        console.log(`error in the getBidForUserController ${err.message}`);
        return res.status(400).json({error: err.message});
    }
}

/*
    @description function to get all the bids 
 */
export const getAllBids = async (req, res)=>{
    try{
        const bids = await Bidding.find();
       return  res.status(200).json(bids);
    }catch(err){
        console.log(`error in the getAllBids ${err.message}`);
        return res.status(500).json({message: `error in the getAllBids ${err.message}`});
    }
}
/*
    @description function to get the bid by the car id
*/
export const getBookingsAtCarIdController = async (req, res)=>{
    const {carId} = req.params;
    if(!carId){
        return res.status(400).json({error: 'carId is required'});
    }
    const objectIdCarId = new mongoose.Types.ObjectId(String(carId)); 
    try{
        const bookings = await Bidding.aggregate([
            {$match : { 'owner._id': req.user._id}},
            {$match: {'vehicle._id': objectIdCarId}},
            { $match: { 'status': { $in: ['approved', 'started'] } } }
        ]);
        return res.status(200).json({bookings});
    }catch(err){
        console.log(`error in the getBookingsAtCarIdController ${err.message}`);
        return res.status(500).json({error: `error in the getBiddingAtCarIdController ${err.message}`});
    }
}

/*
    @description function to get the bookings by the owner id
*/
export const getAllBookingsAtOwnerIdController = async (req, res) => {

    const { page = 1, limit = 10, sort = {}, bookingsType='' } = req.query;
    console.log("ownerID wali bids" , sort, page, limit, bookingsType);
    
    const userId = req.user._id;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    

    const finalSort = { ...sort, createdAt: -1 };
    
    try {
        let totalDocs = await Bidding.countDocuments({ "owner._id": userId, status: { $in: ['approved', 'started', 'ended','reviewed'] } });
        const aggregationPipeline = [
            {
                $match: {
                    "owner._id": userId,
                    status: { $in: ['approved', 'started', 'ended','reviewed'] },
                },
            },
            { $sort: finalSort }, 
            { $skip: skip }, 
            { $limit: limitNumber },
        ];
       
        let filter;

        if(bookingsType === 'started'){
             filter =  {
                $match :{
                    'owner._id' : userId,
                    status: 'started'
                }
            }
            aggregationPipeline[0] = filter;
        }

        if(bookingsType === 'ended'){
             filter =  {
                $match :{
                    'owner._id' : userId,
                    status: 'ended'
                }
            }
            aggregationPipeline[0] = filter;
        }
        if(bookingsType === 'reviewed'){
             filter =  {
                $match :{
                    'owner._id' : userId,
                    status: 'reviewed'
                }
            }
            aggregationPipeline[0] = filter;
        }
        if(bookingsType === 'today'){
            filter = {
                $match : {
                    'owner._id' : userId,
                    'status': { $in: ['approved', 'started', 'ended'] },
                    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0)), $lt: new Date(new Date().setHours(23, 59, 59)) }
                }
            }
        }

        if(filter !== undefined){
            totalDocs = await Bidding.countDocuments(filter.$match);
        }


        
    

        const bookings = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ bookings, totalDocs });
    } catch (err) {
        console.error(`Error in the getAllBookingsAtOwnerIdController: ${err.message}`);
        return res.status(500).json({ error: `Error in the getAllBookingsAtOwnerIdController: ${err.message}` });
    }
};

export const getAllBookingsAtUserIdController = async (req, res)=>{
    console.log(req.query);

    let { page = 1, limit = 10, sort = {} } = req.query;
     if(req.query.sort !== undefined){
        let parsedSort;
        try {
          
            parsedSort = JSON.parse(sort);
        } catch (err) {
            console.log(`Error parsing sort parameter: ${err.message}`);
            return res.status(400).json({ error: 'Invalid sort parameter' });
        }
        sort = parsedSort;
     }
    
    const userId = req.user._id;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = { ...sort, createdAt: -1 };
    const skip = (pageNumber - 1) * limitNumber;
    try{
        const totalDocs = await Bidding.countDocuments({ "from._id": userId, status:  { $in: ['approved', 'started', 'ended'] } });
        const aggregationPipeline = [
            { $match: { "from._id": userId } },
            { 
                $match: { 
                    "status": { $in: ['approved', 'started', 'ended'] } 
                } 
            },
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber }
        ];
        const bookings = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ bookings, totalDocs });
    }catch(err){
        console.log(`error in the getAllBookingsAtUserIdController ${err.message}`);
        return res.status(500).json({error: `error in the getAllBookingsAtUserIdController ${err.message}`});
    }
}

export const getUserBookingHistory = async (req, res) => {
    const { page = 1, limit = 10, sort = {}, startDate = '', search = '' } = req.query;
    console.log(sort, page, limit, startDate);
    const userId = req.user._id;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate page and limit
    if (isNaN(pageNumber) || pageNumber <= 0) {
        return res.status(400).json({ error: "Invalid page number. It must be a positive integer." });
    }
    if (isNaN(limitNumber) || limitNumber <= 0) {
        return res.status(400).json({ error: "Invalid limit number. It must be a positive integer." });
    }

    const skip = (pageNumber - 1) * limitNumber;
    const finalSort = { ...sort, createdAt: -1 };

    try {
        let aggregationPipeline = [];

        // Count total documents for pagination
        const totalDocs = await Bidding.countDocuments({ "from._id": userId, status: "reviewed" });
        console.log(`Total documents: ${totalDocs}`);

        // Add match stage for user and status
        const matchStage = {
            $match: {
                "from._id": userId,
                status: "reviewed",
            },
        };
        aggregationPipeline.push(matchStage);


        // Add pagination and sorting stages
        aggregationPipeline.push(
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber }
        );

        console.log(aggregationPipeline);


        // Execute aggregation pipeline
        const bookings = await Bidding.aggregate(aggregationPipeline);
        console.log(`Bookings fetched: ${bookings.length}`);

        return res.status(200).json({ bookings, totalDocs });
    } catch (err) {
        console.error(`Error in getUserBookingHistory: ${err.message}`);
        return res.status(500).json({ error: `Error in getUserBookingHistory: ${err.message}` });
    }
};
export const getBookingAtBookingIdController = async (req, res)=>{
    const bookingId = req.params.bookingId;
    console.log(bookingId);
    if(!bookingId){
        return res.status(400).json({error: 'bookingId is required'});
    }
    try{
        const booking = await Bidding.findById(bookingId);
        return res.status(200).json({booking}); 
    }catch(err){
        console.log(`error in the getBookingAtBookingIdController ${err.message}`);
        return res.status(500).json({error: `error in the getBookingAtBookingIdController ${err.message}`});
    }
}

export const startBookingController = async (req, res)=>{

    const bookingId = req.params.bookingId;
    const { startOdometerValue } = req.body;
    console.log(startOdometerValue);
    if(startOdometerValue<0 ){
       return res.status(400).json({error : "startOdometer value canno be less than 0 and cannot be empty" });
    }
    console.log(bookingId, startOdometerValue);
    if(!bookingId){
        return res.status(400).json({error: 'bookingId is required'});
    }
    try{
        const booking = await Bidding.findByIdAndUpdate(
            bookingId, 
            { 
              status: 'started', 
              startOdometerValue: startOdometerValue 
            }, 
            { new: true }
          );
          console.log(booking);
          generateAndSendMail({ subject: "Bidding Started", text: `Congrats Your booking on vehicle ${booking.vehicle.name} has been started by the owner ${booking.owner.username} at odometer value ${startOdometerValue} kms, the bid amount is ${booking.amount}, startDate is ${new Date(booking.startDate).toLocaleDateString()}, endDate is ${new Date(booking.endDate).toLocaleDateString()}` });
          return res.status(200).json({ booking });
    }catch(err){
        console.log(`error in the startBookingController ${err.message}`);
        return res.status(500).json({error: `error in the startBookingController ${err.message}`});
    }
}

export const endBookingController = async (req, res)=>{
    const bookingId = req.params.bookingId;
    const { endOdometerValue } = req.body;
    if(!bookingId){
        return res.status(400).json({error: 'bookingId is required'});
    }
    try{
        const booking = await Bidding.findByIdAndUpdate(
            bookingId, 
            { 
              status: 'ended', 
              endOdometerValue: endOdometerValue 
            }, 
            { new: true }
          );
          console.log(booking);
          generateAndSendMail({ subject: "Bidding Ended", text: `Congrats Your booking on vehicle ${booking.vehicle.name} has been ended by the owner ${booking.owner.username} at odometer value ${endOdometerValue} kms, the bid amount is ${booking.amount}, startDate is ${new Date(booking.startDate).toLocaleDateString()}, endDate is ${new Date(booking.endDate).toLocaleDateString()}` });
          return res.status(200).json({ booking });
    }catch(err){
        console.log(`error in the endBookingController ${err.message}`);
        return res.status(500).json({error: `error in the endBookingController ${err.message}`});
    }

}

export const reviewBookingController = async(req, res)=>{
    const bookingId = req.params.bookingId;
    try{
        const booking = await Bidding.findByIdAndUpdate(
            bookingId, 
            { 
              status: 'reviewed'
            }, 
            { new: true }
          );

          console.log("booking status changed");
          return res.status(200).json({ booking });
    }catch(err){
        console.log(`error in the reviewBookingController ${err.message}`);
        return res.status(500).json({error: `error in the reviewBookingController ${err.message}`});
    }

}

export const bookingRecommendationController = async (req, res) => {
    const userCity = req.user.city;
    try {
        const recommendations = await Bidding.aggregate([
            {
                $match: {
                    status: {$in : ['approved', 'started', 'ended', 'reviewed']},
                    'vehicle.city': userCity
                }
            },
            {
                $group: {
                    _id: "$vehicle._id", // Group by vehicle ID
                    count: { $sum: 1 },
                    vehicleBasic: { $first: "$vehicle" } // Basic vehicle info from bidding
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 3
            },
            {
                // Lookup complete vehicle details from Vehicle collection
                $lookup: {
                    from: "vehicles", // MongoDB collection name (likely lowercase)
                    localField: "_id",
                    foreignField: "_id",
                    as: "vehicleComplete"
                }
            },
            {
                $unwind: "$vehicleComplete" // Flatten the lookup array
            },
            {
                $project: {
                    _id: 1,
                    vehicleId: "$_id",
                    vehicle: "$vehicleComplete", // Use the complete vehicle document
                    vehicleImages: "$vehicleComplete.vehicleImages", // Get images specifically
                    count: 1
                }
            }
        ]);
     
        return res.status(200).json({ recommendations });
    } catch(err) {
        console.log(`error in the bookingRecommendationController ${err.message}`);
        return res.status(500).json({error: `error in the bookingRecommendationController ${err.message}`});
    }
}