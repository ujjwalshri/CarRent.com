import Bidding from '../models/bidding.model.js';
import Vehicle from '../models/vehicle.model.js';
import Charges from '../models/charges.model.js';
import Tax from '../models/taxes.model.js';
import {sendInvoiceEmail, sendGenericEmail} from '../services/email.service.js';
import validateBiddingData from '../validation/bid.validation.js';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
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
        selectedAddons,
    } = req.body;
    const { _id, username, email, firstName, lastName, city } = req.user;
    const from = { _id, username, email, firstName, lastName, city };

    if(startDate > endDate){
        return res.status(400).json({error: 'startDate cannot be greater than endDate'});
    }

    try {
        const vehicle = await Vehicle.findById(carId);
        const platformFeePercentage = await Charges.findOne({name: "Platform Fee"});
        const taxes = await Tax.find({isActive: true});
        const biddingData = {
            amount, 
            startDate, 
            endDate, 
            startOdometerValue,
            endOdometerValue,
            owner : {
                _id : owner._id,
                username : owner.username,
                email : owner.email,
                firstName : owner.firstName,
                lastName : owner.lastName
            }, 
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
                status: vehicle.status,
                city: vehicle.city,
            },
            status,
            selectedAddons,
            platformFeePercentage: platformFeePercentage.percentage,
            taxes: taxes.filter(tax => tax.isActive),
            from : {
                _id : from._id,
                username : from.username, 
                email : from.email,
                firstName : from.firstName, 
                lastName : from.lastName
            }
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
            sendGenericEmail({
                to: bidding.from.email,
                subject: "Bidding Approved",
                text: `Congrats Your bid on vehicle ${bidding.vehicle.name} has been approved by the owner ${bidding.owner.username}, the bid amount is  ₹${bidding.amount}, startDate is ${new Date(bidding.startDate).toLocaleDateString()}, endDate is ${new Date(bidding.endDate).toLocaleDateString()}`
            })
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

    let {  page = 1, limit = 10, sortBy={}, carId} = req.query;
    if(sortBy !== undefined){
        sortBy = JSON.parse(sortBy);
    }
    const status = req.query.status || 'pending';
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = {...sortBy, createdAt: -1};
    const skip = (pageNumber - 1) * limitNumber;

    const matchStage =  { $match: { 
        "owner._id": user._id, 
        status,
        startDate:{
            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // making sure user dont see the past bids that cant be accepted
        }
    }};
    
    if(carId){
        matchStage.$match["vehicle._id"] = new ObjectId(String(carId));
    }
    
    try {
        const aggregationPipeline = [
           matchStage,
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
    const objectIdCarId = new mongoose.Types.ObjectId(String(carId)); 
    try{
        const bookings = await Bidding.aggregate([
           {
            $match: {
                "vehicle._id": objectIdCarId,
                status: { $in: ['approved'] },
                startDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)), 
                }
            }
           }
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
    const { page = 1, limit = 10, sort = {}, bookingsType = '', carSearchQuery = '', usernameSearchQuery = '', startDate = null, endDate = null } = req.query;
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
    } else if(bookingsType === 'reviewed') {
        matchStage.status = 'reviewed';
    }

    // Apply date range filter if both startDate and endDate are provided
    if (startDate && endDate) {
       matchStage.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    try {
        const aggregationPipeline = [
            { $match: matchStage }
        ];

        // Add car search query processing
        if (carSearchQuery && carSearchQuery.trim() !== '') {
            aggregationPipeline.push({
                $addFields: {
                    combinedVehicle: {
                        $concat: [
                            { $ifNull: ["$vehicle.name", ""] },
                            " ",
                            { $ifNull: ["$vehicle.company", ""] }
                        ]
                    }
                }
            });
            
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { "vehicle.name": { $regex: carSearchQuery, $options: "i" } },
                        { "vehicle.company": { $regex: carSearchQuery, $options: "i" } },
                        { 
                            $expr: { 
                                $regexMatch: { 
                                    input: "$combinedVehicle",
                                    regex: carSearchQuery,
                                    options: "i" 
                                }
                            } 
                        }
                    ]
                }
            });
        }

        // Add username search query processing
        if (usernameSearchQuery && usernameSearchQuery.trim() !== '') {
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { "from.username": { $regex: usernameSearchQuery, $options: "i" } },
                        { "from.firstName": { $regex: usernameSearchQuery, $options: "i" } },
                        { "from.lastName": { $regex: usernameSearchQuery, $options: "i" } },
                        { "from.email": { $regex: usernameSearchQuery, $options: "i" } }
                    ]
                }
            });
        }

        // Add pagination and sorting
        aggregationPipeline.push({
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
        });

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
    let { page = 1, limit = 10, sort = {}, ownerName = '' } = req.query;
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
                    status: { $in: ['approved', 'started'] }
                }
            }
        ];

        // Add owner name search if provided
        if (ownerName && ownerName.trim() !== '') {
            aggregationPipeline.push({
                $match: {
                    $or: [
                        { "owner.firstName": { $regex: ownerName, $options: "i" } },
                        { "owner.lastName": { $regex: ownerName, $options: "i" } },
                        { "owner.username": { $regex: ownerName, $options: "i" } },
                        { "owner.email": { $regex: ownerName, $options: "i" } },
                        { 
                            $expr: { 
                                $regexMatch: { 
                                    input: { $concat: ["$owner.firstName", " ", "$owner.lastName"] },
                                    regex: ownerName,
                                    options: "i" 
                                }
                            } 
                        }
                    ]
                }
            });
        }

        // Add pagination and sorting
        aggregationPipeline.push({
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
        });

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
    const { page = 1, limit = 10, sort = {}, search = undefined } = req.query;
    
    const userId = req.user._id;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    
    // Parse sort if it's a string
    let sortObj = sort;
    if (typeof sort === 'string') {
        try {
            sortObj = JSON.parse(sort);
        } catch (err) {
            sortObj = { createdAt: -1 }; // default sort
        }
    }

    try {
        const aggregationPipeline = [
            {
                $match: {
                    "from._id": userId,
                    status: { $in: ["reviewed", "ended"] },
                }
            },
            {
                $facet: {
                    bookings: [
                        { $sort: sortObj },
                        { $skip: skip },
                        { $limit: limitNumber }
                    ],
                    totalCount: [
                        { $count: "count" }
                    ]
                }
            }
        ];
       
        if (search?.trim()) {
            const combinedField = { 
                $concat: [ 
                    { $ifNull: ["$vehicle.name", ""] }, 
                    " ", 
                    { $ifNull: ["$vehicle.company", ""] } 
                ] 
            };
        
            aggregationPipeline.unshift({
                $match: {
                    $or: [
                        { "vehicle.name": { $regex: search, $options: "i" } },
                        { "vehicle.company": { $regex: search, $options: "i" } },
                        { 
                            $expr: { 
                                $regexMatch: { 
                                    input: combinedField,
                                    regex: search,
                                    options: "i" 
                                }
                            } 
                        }
                    ]
                }
            });
        }

        const result = await Bidding.aggregate(aggregationPipeline);
        const bookings = result[0].bookings || [];
        const totalDocs = result[0].totalCount[0]?.count || 0;

        
        return res.status(200).json({ 
            bookings, 
            totalDocs
        });
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


          const charges = await Charges.findOne({name: "Platform Fee"});


          sendInvoiceEmail({email: booking.from.email, booking: booking, charges: charges, taxes: booking.taxes})
          .catch((err) => {
            console.error(`Error sending invoice email: ${err.message}`);
          });
          return res.status(200).json({ booking });
    }catch(err){
        console.log(`error in the endBookingController ${err.message}`);
        return res.status(500).json({error: `error in the endBookingController ${err.message}`});
    }

}


/**
 * function to review a booking
 * @description This function updates the status of a booking to 'reviewed'.
 * It takes the bookingId from the request parameters and updates the status in the database.
 * It returns the updated booking information in the response.
 * @param {Object} req - The request object containing the bookingId in the parameters.
 * @param {Object} res - The response object used to send the response back to the client.
 * @returns returns the updated booking information in the response.
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




/**
 * @description This function retrieves all bids that overlap with a given bid's start and end dates.
 * @param {*} req 
 * @param {*} res 
 * @returns return all the overlapping bids for a particular bid
 */
export const getOverlappingBidsController = async (req, res) => {
    try {
        const bidding = await Bidding.findById(req.params.id);
        if (!bidding) {
            return res.status(404).json({ error: "Bidding not found" });
        }

        if (req.user._id.toString() !== bidding.owner._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to view overlapping bids for this bid" });
        }

        const { startDate, endDate } = bidding;
        const overlappingBids = await Bidding.find({
            _id: { $ne: bidding._id },
            'vehicle._id': bidding.vehicle._id,
            status: { $nin: ["rejected", "approved", "ended", "started", "reviewed"] },
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
        });

        return res.status(200).json({ overlappingBids });
    } catch (err) {
        console.error(`Error in getOverlappingBidsController: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};