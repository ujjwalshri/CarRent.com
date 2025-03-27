import Bidding from "../models/bidding.model.js";
import Vehicle from "../models/vehicle.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

/*
@description: function to get suv and sedan cars numbers from the database createdAt between the given dates
*/
export const getSuvVsSedanCarsController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; //2025-03-25T00:00:00.000Z example date format


        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return res.status(400).json({ error: "Invalid date format. Use a valid ISO date string." });
        }

        const aggregationPipeline = [
            {
                $match: {
                    status: 'approved',
                    deleted: false,
                }
            },
            {
                $group: {
                    _id: "$category", 
                    count: { $sum: 1 }
                }
            }
        ];

       
        if (startDate && endDate) {
            aggregationPipeline.unshift({
                $match: {
                    $expr: {
                        $and: [
                            {
                                $gte: [ 
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(startDate)
                                ]
                            },
                            {
                                $lte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(endDate)
                                ]
                            }
                        ]
                    }
                }
            });
        }


        const result = await Vehicle.aggregate(aggregationPipeline);


        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No data found for the given filters." });
        }

        return res.status(200).json({ suvVsSedan: result });
    } catch (err) {
        console.error(`Error in getSuvVsSedanCarsController: ${err.message}`);
        return res.status(500).json({ error: "An internal server error occurred." });
    }
};

/*
@description: function to get the top 10 popular car models from the database
*/
export const top10PopularCarModelsController = async (req, res) => {
 const {startDate, endDate} = req.query;
 try{
    const aggregationPipeline = [
        {
            $group: {
                _id: { $concat: ["$vehicle.company", " ", "$vehicle.name", " ", { "$toString": "$vehicle.modelYear" }] },
                count: { $sum: 1 }
            }
        },
        {
            $sort: {count: -1}
        },
        {
            $limit: 10
        }
    ];

    if (startDate && endDate) {
        aggregationPipeline.unshift({
            $match: {
                $expr: {
                    $and: [
                        {
                            $gte: [
                                { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                new Date(startDate)
                            ]
                        },
                        {
                            $lte: [
                                { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                new Date(endDate)
                            ]
                        }
                    ]
                }
            }
        });
    }


    const result = await Bidding.aggregate(aggregationPipeline);
    return res.status(200).json({ result});

 }catch(err){
        console.log(`error in the top10PopularCarModelsController ${err}`);
        return res.status(500).json({message: "Internal server error"});
 }
}

/*
function to get the top 3 most reviewed cars
*/
export const getTop3MostReviewedCarsController = async (req, res) => {
    const {startDate, endDate } =  req.query;
    try {
        // applying aggregation pipeline on the reviews
        const aggregationPipeline = [
            {
                $group: {
                    _id: { $concat: ["$vehicle.company", " ", "$vehicle.name", " ", { "$toString": "$vehicle.modelYear" }] },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 3
            },
        ];

        if(startDate && endDate){
            aggregationPipeline.unshift({
                $match: {
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(startDate)
                                ]
                            },
                            {
                                $lte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(endDate)
                                ]
                            }
                        ]
                    }
                }
            });
        }


        const result = await Review.aggregate(aggregationPipeline);
        return res.status(200).json({ result });

    } catch (err) {
        console.log(`error in the getTop3MostReviewedCarsController ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/*
function to get the top 3 owners with most cars added
*/
export const top3OwnersWithMostCarsAddedController = async (req, res) => {
    const {startDate, endDate} = req.query;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    status: 'approved',
                    deleted: false,
                }
            },
            {
                $group: {
                    _id: "$owner.username",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {count: -1}
            },
            {
                $limit: 3
            }
        ]

        if(startDate && endDate){
            aggregationPipeline.unshift({
                $match: {
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(startDate)
                                ]
                            },
                            {
                                $lte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(endDate)
                                ]
                            }
                        ]
                    }
                }
            });
        }
        const result = await Vehicle.aggregate(aggregationPipeline);
        return res.status(200).json({result});
    }catch(err){
        console.log(`error in the top3OwnersWithMostCarsAddedController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getOngoingBookingsController = async (req, res) => {


    try{
        const aggregationPipeline = [
            {
                $match: {
                    status: 'started',
                }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
        ]

        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json(result);
    }catch(err){
        console.log(`error in the getOngoingBookingsController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
/*
@description: function to get the average booking duration from the database
*/

export const getAverageBookingDurationController = async (req, res) => {
    try {
        const aggregationPipeline = [
            {
                $match: {
                    status: { $in: ['approved', 'started', 'ended', 'reviewed'] },
                }
            },
            {
                $project: {
                    durationInDays: { 
                        $max: [
                            1,
                            { 
                                $dateDiff: { 
                                    startDate: "$startDate", 
                                    endDate: "$endDate", 
                                    unit: "day" 
                                }
                            }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: "$durationInDays" }
                }
            }
        ];

        const result = await Bidding.aggregate(aggregationPipeline);
        
        return res.status(200).json(result.length ? result[0] : { avgDuration: 0 });
    } catch (err) {
        console.error(`Error in getAverageBookingDurationController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/*
@description: function to get the bidding conversion rate from the database
*/
export const getBiddingConversionRateController = async (req, res) => {
    try {
        const aggregationPipeline = [
            {
                $group: {
                    _id: null,
                    totalBids: { $sum: 1 },
                    totalAccepted: {
                        $sum: {
                            $cond: [
                                { 
                                    $in: ["$status", ["approved", "started", "ended", "reviewed"]] 
                                }, 
                                1, 
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalBids: 1,
                    totalAccepted: 1,
                    conversionRate: {
                        $cond: [
                            { $eq: ["$totalBids", 0] }, 
                            0, 
                            { $multiply: [{ $divide: ["$totalAccepted", "$totalBids"] }, 100] }
                        ]
                    }
                }
            }
        ];

        const result = await Bidding.aggregate(aggregationPipeline);

        return res.status(200).json(result.length ? result[0] : { conversionRate: 0 });
    } catch (err) {
        console.error(`Error in getBiddingConversionRateController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};
/*
@description: function to get the total number of blocked users from the database
*/
export const getAllBlockedUsersController = async (req, res) => {
    try {
       // reutrn all the blocked users count
        const blockedUsers = await User.find({ isBlocked: true }).countDocuments();
        return res.status(200).json( blockedUsers );
    } catch (err) {
        console.error(`Error in getAllBlockedUsersController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/*
@description: function to get the number of biddings per city from the database
*/
export const numberOfBiddingsPerCityController = async (req, res) => {
    const {startDate, endDate} = req.query;
    try {
        const aggregationPipeline = [
            {
                $group: {
                    _id: "$vehicle.city",
                    count: { $sum: 1 }
                }
            }
        ];
        if(startDate && endDate){
            aggregationPipeline.unshift({
                $match: {
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(startDate)
                                ]
                            },
                            {
                                $lte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(endDate)
                                ]
                            }
                        ]
                    }
                }
            });
        }

        const result = await Vehicle.aggregate(aggregationPipeline);
        return res.status(200).json(result);
    } catch (err) {
        console.error(`Error in numberOfBookingsPerCityController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/*
@description: function to get the number of owners per city from the database
*/
export const numberOfOwnersPerCityController = async (req, res) => {

    try {
        const aggregationPipeline = [
            {
                $match: {
                    isSeller: true,
                    isBlocked: false
                }
            },
            {
                $group: {
                    _id: "$city",
                    count: { $sum: 1 }
                }
            }
        ];
        
        const result = await User.aggregate(aggregationPipeline);
        return res.status(200).json(result);
    } catch (err) {
        console.error(`Error in numberOfOwnersPerCityController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
    
}
/*
@description: function to get user description data
*/
export const getUserDescriptionController = async (req, res) => {
    try {
        const aggregationPipeline = [
            {
                $match : {
                    isBlocked: false
                }
            },
            {
                $group: {
                    _id: "$isSeller",
                    count: { $sum: 1 }
                }
            }
        ];
        const result = await User.aggregate(aggregationPipeline);
        return res.status(200).json(result);
    } catch (err) {
        console.error(`Error in getUserDescriptionController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/*
@description: function to get the number of buyers per city from the database
*/
export const numberOfBuyersPerCityController = async(req, res)=>{
    const {startDate, endDate} = req.query;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    isSeller: false,
                    isBlocked: false
                }
            },
            {
                $group: {
                    _id: "$city",
                    count: { $sum: 1 }
                }
            }
        ];
        if(startDate && endDate){
            aggregationPipeline.unshift({
                $match: {
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(startDate)
                                ]
                            },
                            {
                                $lte: [
                                    { $dateFromParts: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } } },
                                    new Date(endDate)
                                ]
                            }
                        ]
                    }
                }
            });
        }
        const result = await User.aggregate(aggregationPipeline);
        return res.status(200).json(result);
    }catch(err){
        console.log(`error in the numberOfBuyersPerCityController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
/*
@description: function to get the number of new users in the last 30 days
*/
export const getNewUsersInLast30DaysController = async(req, res)=>{
    
    try{
       const aggregationPipeline = [
              {
                $match: {
                    isSeller:false,
                    createdAt: {
                          $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                     }
                }
              }
       ]
        const result = await User.aggregate(aggregationPipeline);
        return res.status(200).json(result.length);
    }catch(err){
        console.log(`error in the getNewUsersController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
