import Bidding from '../models/bidding.model.js';

/*
 function to Add a bid to the database
*/
export const addBidController = async (req, res) => {
    const {
        amount, 
        startDate, 
        endDate,  
        startOdometerValue,
        endOdometerValue,
        owner, 
        vehicle,
        status
    } = req.body;
    const { _id, username, email, firstName, lastName, city } = req.user;
    const from = { _id, username, email, firstName, lastName, city };
    const biddingData = {
        amount, 
        startDate, 
        endDate, 
        startOdometerValue,
        endOdometerValue,
        owner, 
        vehicle,
        status,
        from
    }
    const bidding = new Bidding(biddingData);
    try {
        await bidding.save();
        return res.status(201).json({ bidding });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

/*
   function to Get all the bids placed by the user
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
function to get the bids according to the search query from the request.query
*/
export const getBidController = async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    try {
        const aggregationPipeline = [
            { $match: { status } },
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



