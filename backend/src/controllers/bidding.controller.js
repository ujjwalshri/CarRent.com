import Bidding from '../models/bidding.model.js';
import Vehicle from '../models/vehicle.model.js';

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
 
    try {
        const bidding = new Bidding(biddingData);
          await bidding.save();
        return res.status(201).json({ bidding });
    } catch (error) {
        console.log(`error in the addBidController ${error.message}`);
        return res.status(500).json({ error : `error in the addBidController ${error.message}` });
    }
}

/*
 @description: This function will update bids at particular status
*/
export const updateBidStatusController = async (req, res) => {
    const {biddingStatus} = req.body;
  try{
    const bidding = await Bidding.findById(req.params.id);
    console.log("bidding agyi hai");
    if(!bidding){
     console.log("bidding agyi hai");
      return res.status(404).json({error:"Bidding not found"});
    }
    bidding.status = biddingStatus;
    const biddingSaved = await bidding.save();
    if(!biddingSaved){
        return res.status(400).json({error:"Error in updating the bidding status"});
    }
    return res.status(200).json({mssg: "bidding status changed" , bidding: bidding});
  }catch(err){
    console.log(`error in the toggleBidStatusController ${err.message}`);
    return res.status(400).json({error:err.message});
  }
}

/*
 @description function to get the bids according to the search query from the request.query
*/
export const getBidForOwnerController = async (req, res) => {
    const user = req.user;
    const {  page = 1, limit = 10, sort={}} = req.query;
    const status = req.query.status || 'pending';
    console.log(status, page, limit);
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = {...sort, createdAt: -1};
    
    const skip = (pageNumber - 1) * limitNumber;

    try {
        const aggregationPipeline = [
            { $match: { "owner._id": user._id } },
            { $match: {"status": status } },
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber },
            {
                $facet: {
                    bids: [],
                    totalBids: [{ $count: "count" }]
                }
            }
        ];

        const result = await Bidding.aggregate(aggregationPipeline);
        const bids = result[0].bids;
        const totalBids = result[0].totalBids[0] ? result[0].totalBids[0].count : 0;
        const totalPages = Math.ceil(totalBids / limitNumber);

        return res.status(200).json({
            bids,
            pagination: {
                totalBids,
                totalPages,
                currentPage: pageNumber,
                pageSize: limitNumber
            }
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

/*
 @description function to get the bids according to the search query from the request.query
*/
export const getBidForUserController = async (req, res) => {
    const { page = 1, limit = 10, sort = {}, status="pending" } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    let finalSort = { ...sort, createdAt: -1 };
    const skip = (pageNumber - 1) * limitNumber;
    
    try{
        const aggregationPipeline = [
            { $match: { "owner._id": req.user._id } },
            { $match: { "status": status } },
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limitNumber },
            {
                $facet: {
                    bids: [],
                    totalBids: [{ $count: "count" }]
                }
            }
        ];
        const result = await Bidding.aggregate(aggregationPipeline);
        const bids = result[0].bids;
        const totalBids = result[0].totalBids[0] ? result[0].totalBids[0].count : 0;
        const totalPages = Math.ceil(totalBids / limitNumber);
        return res.status(200).json({
            bids,
            pagination: {
                totalBids,
                totalPages,
                currentPage: pageNumber,
                pageSize: limitNumber
            }
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
        if(!bids){
            return res.status(404).json({message: 'No bids found'});
        }
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
    try{
        const bookings = await Bidding.aggregate([
            {$match: {'vehicle._id': carId}},
            {$match : {'status': 'approved'}}
        ])
        if(!bookings){
            return res.status(404).json({message: 'No bids found'});
        }
        return res.status(200).json({bookings});
    }catch(err){
        console.log(`error in the getBookingsAtCarIdController ${err.message}`);
        return res.status(500).json({error: `error in the getBiddingAtCarIdController ${err.message}`});
    }
}



