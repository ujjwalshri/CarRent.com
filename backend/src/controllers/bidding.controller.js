import Bidding from '../models/bidding.model.js';
import Vehicle from '../models/vehicle.model.js';
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
        const bidding = new Bidding(biddingData);
        await bidding.save();
        return res.status(201).json({ bidding });
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
                    status: { $ne: "rejected" },
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate },
                },
                { $set: { status: "rejected" } },
                { session }
            );
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
    console.log(status, page, limit);
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
            {$match: {'vehicle._id': objectIdCarId}},
            {$match : {'status': 'approved'}}
        ]);
        return res.status(200).json({bookings});
    }catch(err){
        console.log(`error in the getBookingsAtCarIdController ${err.message}`);
        return res.status(500).json({error: `error in the getBiddingAtCarIdController ${err.message}`});
    }
}

export const getAllBookingsAtOwnerIdController = async (req, res)=>{
    const { page = 1, limit = 10, sort = {} } = req.query;
    const userId = req.user._id;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = { ...sort, createdAt: -1 };
    const skip = (pageNumber - 1) * limitNumber;
    try{
        const aggregationPipeline = [
            { $match: { "owner._id": userId } },
            { $match: { "status": "approved" } },
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber }
        ];
        const bookings = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ bookings });
    }catch(err){
        console.log(`error in the getAllBookingsAtOwnerIdController ${err.message}`);
        return res.status(500).json({error: `error in the getAllBookingsAtOwnerIdController ${err.message}`});
    }
}


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
        const totalDocs = await Bidding.countDocuments({ "from._id": userId, status: "approved" });
        const aggregationPipeline = [
            { $match: { "from._id": userId } },
            { $match: { "status": "approved" } },
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

export const getUserBookingHistory = async (req,res)=>{
    const { page = 1, limit = 10, sort = {} } = req.query;
    const userId = req.user._id;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = { ...sort, createdAt: -1 };
    const skip = (pageNumber - 1) * limitNumber;
    try{
        const aggregationPipeline = [
            { $match: { "from._id": userId } },
            { $match: { "status": "reviewed"} },
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber }
        ];
        const bookings = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ bookings });
    }catch(err){
        console.log(`error in the getUserBookingHistory ${err.message}`);
        return res.status(500).json({error: `error in the getUserBookingHistory ${err.message}`});
    }

}