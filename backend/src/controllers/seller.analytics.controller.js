import Vehicle from "../models/vehicle.model.js";
import Bidding from "../models/bidding.model.js";
import Review from "../models/review.model.js";



/*
@description: function to get the car description for the seller for the given date range 
*/
export const getCarDescriptionController = async (req, res) => {
    const userId = req.user._id;


    try {
        const { startDate, endDate } = req.query; //2025-03-25T00:00:00.000Z example date format


        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return res.status(400).json({ error: "Invalid date format. Use a valid ISO date string." });
        }

        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                    status: "approved"
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
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate).setHours(23, 59, 59, 999)
                    }
                }
            });
        }


        const result = await Vehicle.aggregate(aggregationPipeline);


        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No data found for the given filters." });
        }

        return res.status(200).json({ suvVsSedan: result });
    } catch (error) {
        console.log(`error in the getCarDescriptionController ${error}`);
        return res.status(400).json({ error: error.message });
    }
}
/*
@description: function to get the top 3 most popular cars for the seller for the given date range
*/
export const getTop3MostPopularCarsController = async (req, res) => {
    const{startDate, endDate} = req.query;
    const userId = req.user._id;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                }
            },
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
                $limit: 3
            }
        ];

        if (startDate && endDate) {
            aggregationPipeline.unshift({
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            });
        }

        const result = await Bidding.aggregate(aggregationPipeline);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No data found for the given filters." });
        }

        return res.status(200).json({ top3MostPopularCars: result });

    }catch(err){
        console.log(`error in the top3MostPopularCarsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

/*
@description: function to get the number of biddings per location for the seller for the given date range
*/
export const numberOfBiddingsPerLocationController = async (req, res) => {
    const userId = req.user._id;
    const{startDate, endDate} = req.query;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                }
            },
            {
                $group: {
                    _id: "$vehicle.city",
                    count: { $sum: 1 }
                }
            }
        ];

        if (startDate && endDate) {
            aggregationPipeline.unshift({
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            });
        }



        const result = await Bidding.aggregate(aggregationPipeline);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No data found for the given filters." });
        }

        return res.status(200).json({ numberOfBidsPerLocation: result });

    }catch(err){
        console.log(`error in the numberOfBidsPerLocationController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

/*
@description: function to get the total cars added by the seller for the given date range
*/
export const getTotalCarsAddedController = async (req, res) => {
    const userId = req.user._id;
    const{startDate, endDate} = req.query;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                    status: "approved"
                }
            },
            {
                $group: {
                    _id: "totalCarsAdded",
                    count: { $sum: 1 }
                }
            }
        ];

        if (startDate && endDate) {
            aggregationPipeline.unshift({
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            });
        }

        const result = await Vehicle.aggregate(aggregationPipeline);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No data found for the given filters." });
        }

        return res.status(200).json({ totalCarsAdded: result });

    }catch(err){
        console.log(`error in the totalCarsAddedController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}


/*
@description: function to get the number of bids on my cars for the seller for the given date range
*/
export const numberOfBidsOnMyCarsController = async (req, res) => {
    const userId = req.user._id;
    const{startDate, endDate} = req.query;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                }
            },
            {
                $group: {
                    _id: "$_id",
                    count: { $sum: 1 }
                }
            }
        ];

        if (startDate && endDate) {
            aggregationPipeline.unshift({
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            });
        }

        const result = await Bidding.aggregate(aggregationPipeline);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No data found for the given filters." });
        }

        return res.status(200).json({ numberOfBidsOnMyCars: result });

    }catch(err){
        console.log(`error in the numberOfBidsOnMyCarsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}
/*
@description: function to get the number of cars by fuel type for the seller for the given date range
*/
export const getCarCountByFuelTypeController = async (req, res) => {
    const userId = req.user._id;
    const {startDate, endDate} = req.query;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                }
            },
            {
                $group: {
                    _id: "$vehicle.fuelType",
                    count: { $sum: 1 }
                }
            }
        ]
        if (startDate && endDate) {
            aggregationPipeline.unshift({
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            });
        }
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ carCountByLocalVsOutstationVsBoth: result });

    }catch(err){
        console.log(`error in the getCarCountByLocalVsOutstationVsBoth ${err}`);
        return res.status(400).json({ error: err.message });
    }
}


export const getTotalRevenueController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate);

    try {
        if (startDate && !endDate) {
            return res.status(400).json({ 
                error: "If start date is provided, end date is required" 
            });
        }

        if (startDate && endDate && (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate)))) {
            return res.status(400).json({ 
                error: "Invalid date format. Use a valid ISO date string." 
            });
        }

        // Base pipeline for revenue calculation
        const basePipeline = [
            {
                $match: {
                    "owner._id": userId,
                    status: { $in: ["ended", "reviewed"] }
                }
            },
            {
                $addFields: {
                    numberOfDays: {
                        $ceil: {
                            $divide: [
                                { $subtract: ["$endDate", "$startDate"] },
                                1000 * 60 * 60 * 24 
                            ]
                        }
                    },
                    kilometersDriven: {
                        $subtract: ["$endOdometerValue", "$startOdometerValue"]
                    }
                }
            },
            {
                $addFields: {
                    baseAmount: { $multiply: ["$amount", { $add: ["$numberOfDays", 1] }] } ,
                    excessKilometers: {
                        $max: [
                            { $subtract: ["$kilometersDriven", 300] },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    fine: {
                        $multiply: ["$excessKilometers", 10]
                    },
                    totalBookingRevenue: {
                        $add: [
                            "$baseAmount",
                            { $multiply: [
                                { $max: [
                                    { $subtract: ["$kilometersDriven", 300] },
                                    0
                                ]},
                                10
                            ]}
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalBookingRevenue" },
                    totalFineCollected: { $sum: "$fine" },
                    totalBookings: { $sum: 1 },
                    averageRevenue: { $avg: "$totalBookingRevenue" }
                }
            }
        ];

        // Execute pipeline for total revenue (all time)
        const totalResult = await Bidding.aggregate(basePipeline);

        let response = {};

        if (totalResult && totalResult.length > 0) {
            response.allTimeRevenue = totalResult[0];
        }


        if (startDate && endDate) {
            const dateFilteredPipeline = [
                {
                    $match: {
                        "owner._id": userId,
                        status: { $in: ["ended", "reviewed"] },
                        updatedAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                ...basePipeline.slice(1) // Use the rest of the base pipeline
            ];

            const filteredResult = await Bidding.aggregate(dateFilteredPipeline);
            
            if (filteredResult && filteredResult.length > 0) {
                response.dateFilteredRevenue = filteredResult[0];
            } else {
                response.dateFilteredRevenue = {
                    totalRevenue: 0,
                    totalFineCollected: 0,
                    totalBookings: 0,
                    averageRevenue: 0
                };
            }
        }

        if (Object.keys(response).length === 0) {
            return res.status(404).json({ 
                message: "No revenue data found." 
            });
        }

        return res.status(200).json(response);

    } catch (err) {
        console.error(`Error in getTotalRevenueController: ${err}`);
        return res.status(500).json({ error: err.message });
    }
};

export const getOngoingBookingsController = async (req, res) => {
    const userId = req.user._id;

    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                    status: "started"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    count: { $sum: 1 }
                }
            }
        ]
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ result });
    }catch(err){
        console.log(`error in the getOngoingBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}





export const getMyBidsInLast7DaysVsOtherSellerAvgBidsController = async (req, res) => {
    const userId =req.user._id; 

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const aggregationPipeline = [
            
            {
                $match: {
                    startDate: { $gte: sevenDaysAgo },
                    'owner._id': userId
                }
            },
          
            {
                $group: {
                    _id: null,
                    totalBids: { $sum: 1 }
                }
            },
        ];
        const aggregationPipeline2 = [
            {
                $match: {
                    startDate: { $gte: sevenDaysAgo },
                    'owner._id': { $ne: userId } 
                }
            },
            {
                $group: {
                    _id: "$owner._id", 
                    totalBids: { $sum: 1 } 
                }
            },
            {
                $group: {
                    _id: null,
                    avgBids: { $avg: "$totalBids" } // Compute the average number of bids per seller
                }
            },
            {
                $project: {
                    _id: 0,
                    avgBids: 1
                }
            }
        ];
2        
        

       const res1 = await Bidding.aggregate(aggregationPipeline2);
    
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ result, res1 });

    } catch (err) {
        console.error(`Error in getMyBidsInLast7DaysVsOtherSellerAvgBidsController:`, err);
        return res.status(500).json({ error: "An error occurred while processing the request." });
    }
};

export const carWiseBookingsController = async (req, res) => {
    const userId = req.user._id;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                    status: {$in: ["approved","started", "ended", "reviewed"]}
                }
            },
            {
                $group: {
                    _id: { $concat: ["$vehicle.company", " ", "$vehicle.name", " ", { "$toString": "$vehicle.modelYear" }] },
                    count: { $sum: 1 }
                }
            }
        ]
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ carWiseBookings: result });
    }catch(err){
        console.log(`error in the carWiseBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

export const getMonthWiseBookingsController = async (req, res) => {
    const { year } = req.query;
    const userId = req.user._id;
    try {
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status: { $in: ["approved"] }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%B", date: "$startDate" } 
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } 
            }
        ];

        if (year === 'thisYear') {
            aggregationPipeline.unshift({
                $match: {
                    $expr: {
                        $eq: [{ $year: "$startDate" }, new Date().getFullYear()],
                    } 
                }
            });
        } else if (year === 'lastYear') {
            aggregationPipeline.unshift({
                $match: {
                    $expr: {
                        $eq: [{ $year: "$startDate" }, new Date().getFullYear() - 1]
                    }
                }
            });
        }

        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ monthWiseBookings: result });
    } catch (err) {
        console.log(`error in the getMonthWiseBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
};

export const monthWiseCarTripsController = async (req, res) => {
    const userId = req.user._id;

    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                    status: "ended"
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%B", date: "$startDate" } 
                    },
                    totalDistance: { $sum: { $subtract: ["$endOdometerValue", "$startOdometerValue"] } }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ monthWiseCarTrips: result ? result : [] });
    }catch(err){
        console.log(`error in the monthWiseCarTripsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

export const top3CarsWithMostEarningController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status: { $in: ["ended", "reviewed"] },
                    ...(start && end && {
                        updatedAt: { $gte: start, $lte: end }
                    })
                }
            },
            {
                $addFields: {
                    bookingDays: {
                        $divide: [
                            { $subtract: ["$endDate", "$startDate"] },
                            1000 * 60 * 60 * 24 // Convert milliseconds to days
                        ]
                    },
                    exceededKm: {
                        $max: [
                            0,
                            { $subtract: ["$endOdometerValue", "$startOdometerValue"] } // Subtract only two values
                        ]
                    },
                    exceededKmCharge: {
                        $multiply: [
                            {
                                $max: [
                                    0,
                                    { $subtract: [{ $subtract: ["$endOdometerValue", "$startOdometerValue"] }, 300] }
                                ]
                            },
                            10
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $concat: [
                            "$vehicle.company",
                            " ",
                            "$vehicle.name",
                            " ",
                            { "$toString": { "$ifNull": ["$vehicle.modelYear", ""] } }
                        ]
                    },
                    totalRevenue: {
                        $sum: {
                            $add: [
                                {
                                    "$multiply": [
                                      { "$add": ["$bookingDays", 1] }, 
                                      "$amount"
                                    ]
                                  }
,                                  
                                "$exceededKmCharge"
                            ]
                        }
                    }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 3 }
        ];

        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ top3CarsWithMostEarning: result });
    } catch (err) {
        console.error(`Error in top3CarsWithMostEarning: ${err}`);
        return res.status(400).json({ error: err.message });
    }
};

export const top3CostumersWithMostBookingsController = async (req, res) => {
    const userId = req.user._id;
    try{
            const aggregationPipeline = [
                {
                    $match: {
                        'owner._id': userId,
                        status: {$in: ["approved", "started", "ended", "reviewed"]}
                    }
                },
                {
                    $group: {
                        _id: "$from.username" , 
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 3
                }
            ]
            const result = await Bidding.aggregate(aggregationPipeline);
            return res.status(200).json({ top3CostumersWithMostBookings: result });
    }catch(err){
        console.log(`error in the top3CostumersWithMostBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

export const peakBiddingHoursController = async (req, res) => {
    const userId = req.user._id;
    const {startDate, endDate} = req.query;
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    ...(startDate && endDate && {
                        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    })  
                }
            },
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }

        ]
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ peakBiddingHours: result });
    }catch(err){
        console.log(`error in the peakBiddingHoursController ${err}`);
    }
}

export const getNegativeReviewsPercentageController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate);
    try {

        const matchFilter = {
            ...(startDate && endDate && {
                createdAt: { 
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
        };


        const negativeReviewsResult = await Review.aggregate([
            {
                $lookup: {
                    from: "vehicles", 
                    localField: "vehicle._id",  
                    foreignField: "_id", 
                    as: "vehicleData"
                }
            },
            { $unwind: "$vehicleData" },
            { $match: { "vehicleData.owner._id": userId, rating: { $lt: 3 }, ...matchFilter } },
            { $count: "negativeCount" }
        ]);



        const totalReviewsResult = await Review.aggregate([
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle._id",
                    foreignField: "_id",
                    as: "vehicleData"
                }
            },
            { $unwind: "$vehicleData" },
            { $match: { "vehicleData.owner._id": userId, ...matchFilter } },
            { $count: "totalCount" }
        ]);



        const negativeCount = negativeReviewsResult.length ? negativeReviewsResult[0].negativeCount : 0;
        const totalCount = totalReviewsResult.length ? totalReviewsResult[0].totalCount : 0;


        const negativeReviewsPercentage = totalCount > 0 ? ((negativeCount / totalCount) * 100).toFixed(2) : 0;

        return res.status(200).json({
            negativeReviewsPercentage,
            totalReviews: totalCount,
            negativeReviews: negativeCount
        });

    } catch (err) {
        console.log(`Error in getNegativeReviewsPercentageController: ${err}`);
        return res.status(400).json({ error: err.message });
    }
};
