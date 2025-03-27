import Vehicle from "../models/vehicle.model.js";
import Bidding from "../models/bidding.model.js";


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
        return res.status(200).json({ carCountByLocalVsOutstationVsBoth: result });

    }catch(err){
        console.log(`error in the getCarCountByLocalVsOutstationVsBoth ${err}`);
        return res.status(400).json({ error: err.message });
    }
}


export const getTotalRevenueController = async (req, res) => {
    const userId = req.user._id;

    try {
        const aggregationPipeline = [
         
            {
                $match: {
                    "owner._id": userId,
                    status: { $in: ["ended", "reviewed"] }
                }
            },

          
            {
                $project: {
                    amount: "$amount",
                    distanceTraveled: { 
                        $subtract: ["$endOdometerValue", "$startOdometerValue"] 
                    },
                    extraDistance: {
                        $max: [{ $subtract: [{ $subtract: ["$endOdometerValue", "$startOdometerValue"] }, 300] }, 0]
                    },
                    fine: {
                        $multiply: [
                            { $max: [{ $subtract: [{ $subtract: ["$endOdometerValue", "$startOdometerValue"] }, 300] }, 0] },
                            10
                        ]
                    },
                    numberOfDays: {
                        $add: [
                            { $subtract: [{ $toDate: "$endDate" }, { $toDate: "$startDate" }] },
                            1 * 24 * 60 * 60 * 1000 
                        ]
                    },
                    totalPayablePrice: {
                        $add: [
                            "$amount",
                            {
                                $multiply: [
                                    { $max: [{ $subtract: [{ $subtract: ["$endOdometerValue", "$startOdometerValue"] }, 300] }, 0] },
                                    10
                                ]
                            }
                        ]
                    }
                }
            },

         
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPayablePrice" },
                    totalFineCollected: { $sum: "$fine" }
                }
            },

          
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalFineCollected: 1
                }
            }
        ];

        const result = await Bidding.aggregate(aggregationPipeline);

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No revenue data found." });
        }

        return res.status(200).json({ totalRevenueData: result[0] });

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