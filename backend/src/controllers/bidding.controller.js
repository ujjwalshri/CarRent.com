import Bidding from '../models/bidding.model.js';
import Vehicle from '../models/vehicle.model.js';
import AddOns from '../models/add-ons.model.js';
import {sendInvoiceEmail} from '../utils/email.service.js';
import validateBiddingData from '../validation/bid.validation.js';
import {generateAndSendMail} from '../utils/gen.mail.js';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import mongoose from 'mongoose';
import sqsProducerService from '../services/SQS.producer.service.js';

dotenv.config();
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_BUCKET_REGION
});

const sqs = new AWS.SQS();

/**
 * Add a Bid Controller
 * 
 * Creates a new bid in the system for a vehicle rental request.
 * Validates bid data, retrieves vehicle details, and processes the bid through SQS.
 * 
 * @async
 * @function addBidController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.carId - ID of the vehicle being bid on
 * @param {Object} req.body - Request body containing bid details
 * @param {number} req.body.amount - Bid amount
 * @param {Date} req.body.startDate - Rental start date
 * @param {Date} req.body.endDate - Rental end date
 * @param {number} req.body.startOdometerValue - Starting odometer reading
 * @param {number} req.body.endOdometerValue - Ending odometer reading
 * @param {Object} req.body.owner - Vehicle owner details
 * @param {string} req.body.status - Bid status
 * @param {Object} req.user - Authenticated user making the bid
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success/error message
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
        status,
        selectedAddons
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
            selectedAddons,
            from
        }
        if(validateBiddingData(biddingData).error){
            return res.status(400).json({error: validateBiddingData(biddingData).error.details[0].message});
        }

        // Send the bidding data to SQS queue using the producer service
        await sqsProducerService.sendBidMessage(biddingData);
        return res.status(201).json({ message: 'Bidding added successfully' });
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
            generateAndSendMail({ subject: "Bidding Approved", text: `Congrats Your bid on vehicle ${bidding.vehicle.name} has been approved by the owner ${bidding.owner.username}, the bid amount is ${bidding.amount}, startDate is ${new Date(bidding.startDate).toLocaleDateString()}, endDate is ${new Date(bidding.endDate).toLocaleDateString()}`, to: bidding.from.email })
            .catch((err) => {
                console.error(`Error sending bidding email: ${err.message}`);
            });
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
    console.log(req.query);
    let {  page = 1, limit = 10, sortBy={}} = req.query;
    console.log(sortBy, page, limit);
    if(sortBy !== undefined){
        sortBy = JSON.parse(sortBy);
    }
    const status = req.query.status || 'pending';
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = {...sortBy, createdAt: -1};
    console.log(finalSort);
    const skip = (pageNumber - 1) * limitNumber;
    try {
        const aggregationPipeline = [
            { $match: { "owner._id": user._id, status } },
            {
                $facet: {
                    metadata: [
                        { $count: "totalDocs" }
                    ],
                    data: [
                        { $sort: finalSort },
                        { $skip: skip },
                        { $limit: limitNumber }
                    ]
                }
            }
        ];
        console.log(aggregationPipeline);

        const [result] = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({
            result: result.data,
            totalDocs: result.metadata[0]?.totalDocs || 0
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

/*
 @description function to get the  bids for the user according to the search query from the request.query
*/
export const getBidForUserController = async (req, res) => {

    let { page = 1, limit = 10, sort = {}, status="pending" } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = { ...sort, createdAt: -1 };
    const skip = (pageNumber - 1) * limitNumber;
    
    try{
        const aggregationPipeline = [
            { $match: { "from._id": req.user._id, status } },
            {
                $facet: {
                    metadata: [
                        { $count: "totalDocs" }
                    ],
                    data: [
                        { $sort: finalSort },
                        { $skip: skip },
                        { $limit: limitNumber }
                    ]
                }
            }
        ];

        const [result] = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({
            bids: result.data,
            totalDocs: result.metadata[0]?.totalDocs || 0
        });
    }catch(err){
        console.log(`error in the getBidForUserController ${err.message}`);
        return res.status(400).json({error: err.message});
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
    const { page = 1, limit = 10, sort = {}, bookingsType = '' } = req.query;
    console.log("ownerID wali bids", sort, page, limit, bookingsType);

    const userId = req.user._id;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const finalSort = { ...sort, createdAt: -1 };

    // Build base match
    let matchStage = {
        "owner._id": userId,
        status: { $in: ['approved', 'started', 'ended', 'reviewed'] },
    };

    // Modify matchStage based on bookingsType
    if (bookingsType === 'started') {
        matchStage.status = 'started';
    } else if (bookingsType === 'ended') {
        matchStage.status = 'ended';
    } else if (bookingsType === 'reviewed') {
        matchStage.status = 'reviewed';
    } else if (bookingsType === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        matchStage.startDate = { $lte: todayEnd };
        matchStage.endDate = { $gte: todayStart };
    }

    try {
        const aggregationPipeline = [
            { $match: matchStage },
            {
                $facet: {
                    bookings: [
                        { $sort: finalSort },
                        { $skip: skip },
                        { $limit: limitNumber },
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        const result = await Bidding.aggregate(aggregationPipeline);

        const bookings = result[0].bookings;
        const totalDocs = result[0].totalCount[0]?.count || 0;

        return res.status(200).json({ bookings, totalDocs });
    } catch (err) {
        console.error(`Error in the getAllBookingsAtOwnerIdController: ${err.message}`);
        return res.status(500).json({ error: `Error in the getAllBookingsAtOwnerIdController: ${err.message}` });
    }
};

/*
    @description function to get the bookings by the user id
    uses req.query for the query parameters and applies pagination and sorting to the results
    return all the booking with status approved, started, ended at a particular user id
*/  
export const getAllBookingsAtUserIdController = async (req, res)=>{
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
        const aggregationPipeline = [
            {
                $match: {
                    "from._id": userId,
                    status: { $in: ['approved', 'started', 'ended'] }
                }
            },
            {
                $facet: {
                    bookings: [
                        { $sort: finalSort },
                        { $skip: skip },
                        { $limit: limitNumber }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];

        const result = await Bidding.aggregate(aggregationPipeline);
        const bookings = result[0].bookings;
        const totalDocs = result[0].totalCount[0]?.count || 0;

        return res.status(200).json({ bookings, totalDocs });
    }catch(err){
        console.log(`error in the getAllBookingsAtUserIdController ${err.message}`);
        return res.status(500).json({error: `error in the getAllBookingsAtUserIdController ${err.message}`});
    }
}
/*
    @description function to get the bookings history for the logged in user
    uses req.query for the query parameters and applies pagination and sorting to the results
    return all the booking history for the particular user
*/  
export const getUserBookingHistory = async (req, res) => {
    const { page = 1, limit = 10, sort = {}, startDate = '', search = '' } = req.query;
    console.log('Received sort:', sort);
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

    // Parse sort if it's a string
    let sortObj = sort;
    if (typeof sort === 'string') {
        try {
            sortObj = JSON.parse(sort);
        } catch (err) {
            console.error('Error parsing sort:', err);
            sortObj = { createdAt: -1 }; // default sort
        }
    }

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

        // Add sort stage
        aggregationPipeline.push({ $sort: sortObj });

        // Add pagination stages
        aggregationPipeline.push(
            { $skip: skip },
            { $limit: limitNumber }
        );

        console.log('Aggregation Pipeline:', JSON.stringify(aggregationPipeline, null, 2));

        // Execute aggregation pipeline
        const bookings = await Bidding.aggregate(aggregationPipeline);
        console.log(`Bookings fetched: ${bookings.length}`);

        return res.status(200).json({ bookings, totalDocs });
    } catch (err) {
        console.error(`Error in getUserBookingHistory: ${err.message}`);
        return res.status(500).json({ error: `Error in getUserBookingHistory: ${err.message}` });
    }
};

/*
    @description function to get a booking by the booking id
*/
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
/*
    @description function to startBooking at particular booking id
    takes bookingId and startOdometerValue in the request body 
    returns the updated booking
*/
export const startBookingController = async (req, res)=>{

    const bookingId = req.params.bookingId;
    
    const { startOdometerValue } = req.body;
    console.log("startOdometerValue at backend" + startOdometerValue);
   
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

          return res.status(200).json({ booking });
    }catch(err){
        console.log(`error in the startBookingController ${err.message}`);
        return res.status(500).json({error: `error in the startBookingController ${err.message}`});
    }
}
/*
    @description function to endBooking at particular booking id
    takes bookingId and endOdometerValue in the request body 
    returns the updated booking
*/
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

          sendInvoiceEmail({email: booking.from.email, booking: booking})
          .catch((err) => {
            console.error(`Error sending invoice email: ${err.message}`);
          });
          return res.status(200).json({ booking });
    }catch(err){
        console.log(`error in the endBookingController ${err.message}`);
        return res.status(500).json({error: `error in the endBookingController ${err.message}`});
    }

}
/*
    @description function to reviewBooking at particular booking id
    takes bookingId in the request params
    returns the updated booking
*/
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

          return res.status(200).json({ booking });
    }catch(err){
        console.log(`error in the reviewBookingController ${err.message}`);
        return res.status(500).json({error: `error in the reviewBookingController ${err.message}`});
    }

}
/*
    @description function to get the booking recommendations for the user
    returns the top 3 vehicle recommendations for the user
*/
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
                $project: {
                    _id: 1,
                    vehicleId: "$_id",
                    vehicle: "$vehicleBasic",
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


export const addAddOnsController = async (req, res) => {
    const { name, price } = req.body;
    const owner = {
        _id: req.user._id,
        username: req.user.username
    };
    try{
        const addOns = await AddOns.create({ name, price, owner });
        console.log(addOns);
        return res.status(200).json({ addOns });
    }catch(err){
        console.log(`error in the addAddOnsController ${err.message}`);
        return res.status(500).json({error: `error in the addAddOnsController ${err.message}`});
    }
}

export const getAllAddOnsController = async (req, res) => {
    const ownerId = req.user._id;
   try{
    const addOns = await AddOns.find({ "owner._id": ownerId, isDeleted: false });
    console.log(addOns);
    return res.status(200).json({ addOns });
   }catch(err){
    console.log(`error in the getAllAddOnsController ${err.message}`);
    return res.status(500).json({error: `error in the getAllAddOnsController ${err.message}`});
   }
}

export const getAddOnsForUserController = async(req, res)=>{
    const ownerId = req.params.ownerId;
    try{
        const addOns = await AddOns.find({ "owner._id": ownerId, isDeleted: false });
        return res.status(200).json({ addOns });
    }catch(err){
        console.log(`error in the getAddOnsForUserController ${err.message}`);
        return res.status(500).json({error: `error in the getAddOnsForUserController ${err.message}`});
    }
}

export const deleteAddOnsController  = async (req, res) => {
    const addonId = req.params.addonId;
    try{
        const addOns = await AddOns.findByIdAndUpdate(addonId, { isDeleted: true }, { new: true });
        return res.status(200).json({ addOns });
    }catch(err){
        console.log(`error in the deleteAddOnsController ${err.message}`);
        return res.status(500).json({error: `error in the deleteAddOnsController ${err.message}`});
    }
}
