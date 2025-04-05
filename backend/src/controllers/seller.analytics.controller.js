/**
 * Seller Analytics Controller
 * This controller handles all analytics-related operations for sellers including revenue calculations,
 * booking statistics, and performance metrics.
 */

import Vehicle from "../models/vehicle.model.js";
import Bidding from "../models/bidding.model.js";
import Review from "../models/review.model.js";

const timePeriods = {
    last7days: 7,
    last30days: 30,
    last90days: 90,
    last365days: 365,
};

/**
 * Get Car Description Controller
 * Retrieves the distribution of car categories (SUV vs Sedan) for a seller's approved vehicles
 * 
 * @param {Object} req - Express request object containing query parameters
 * @param {string} req.query.startDate - Optional start date for filtering (ISO format)
 * @param {string} req.query.endDate - Optional end date for filtering (ISO format)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing category distribution
 */
export const getCarDescriptionController = async (req, res) => {
    const userId = req.user._id;

    try {
        const { startDate, endDate } = req.query;
         if(!startDate || !endDate){
            return res.status(400).json({ error: "startDate and endDate are required" });
         }
      
        // Base aggregation pipeline to count vehicles by category
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status: "approved",
                    createdAt : {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ];

        const result = await Vehicle.aggregate(aggregationPipeline);

        return res.status(200).json({ suvVsSedan: result });
    } catch (error) {
        console.log(`error in the getCarDescriptionController ${error}`);
        return res.status(400).json({ error: error.message });
    }
}

/**
 * Get Top 3 Most Popular Cars Controller
 * Retrieves the top 3 most booked cars for a seller based on booking count
 * 
 * @param {Object} req - Express request object containing query parameters
 * @param {string} req.query.startDate - Optional start date for filtering
 * @param {string} req.query.endDate - Optional end date for filtering
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing top 3 cars with booking counts
 */
export const getTop3MostPopularCarsController = async (req, res) => {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;
    if(!startDate || !endDate){
        return res.status(400).json({ error: "startDate and endDate are required" });
    }
    
    try {
        // Base pipeline to count bookings per car
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    createdAt : {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
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
            }
        ];

     
        const result = await Bidding.aggregate(aggregationPipeline);

       

        return res.status(200).json({ top3MostPopularCars: result });

    } catch (err) {
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
    if(!startDate || !endDate){
        return res.status(400).json({ error: "startDate and endDate are required" });
    }
    try{
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id' : userId,
                    createdAt : {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: "$vehicle.city",
                    count: { $sum: 1 }
                }
            }
        ];


        const result = await Bidding.aggregate(aggregationPipeline);


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

/**
 * Get Total Revenue Controller
 * Calculates total revenue for a seller including base booking amount and excess kilometer charges
 * Revenue calculation includes:
 * 1. Base amount = daily rate * number of days
 * 2. Excess kilometer charge = (kilometers driven - 300) * 10 per km
 * 
 * @param {Object} req - Express request object containing query parameters
 * @param {string} req.query.startDate - Optional start date for filtering
 * @param {string} req.query.endDate - Optional end date for filtering
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing revenue metrics
 */
export const getTotalRevenueController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    try {
        // Validate date parameters
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
                    // Calculate number of days between start and end date
                    numberOfDays: {
                        $ceil: {
                            $divide: [
                                { $subtract: ["$endDate", "$startDate"] },
                                1000 * 60 * 60 * 24 
                            ]
                        }
                    },
                    // Calculate total kilometers driven
                    kilometersDriven: {
                        $subtract: ["$endOdometerValue", "$startOdometerValue"]
                    }
                }
            },
            {
                $addFields: {
                    // Calculate base amount (daily rate * number of days)
                    baseAmount: { $multiply: ["$amount", { $add: ["$numberOfDays", 1] }] },
                    // Calculate excess kilometers beyond 300km limit
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
                    // Calculate fine for excess kilometers (10 per km)
                    fine: {
                        $multiply: ["$excessKilometers", 10]
                    },
                    // Calculate total revenue (base amount + fine)
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

        // If date range is provided, calculate filtered revenue
        if (startDate && endDate) {
            const dateFilteredPipeline = [
                {
                    $match: {
                        "owner._id": userId,
                        status: { $in: ["ended", "reviewed"] },
                        endDate: {
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


        return res.status(200).json(response);

    } catch (err) {
        console.error(`Error in getTotalRevenueController: ${err}`);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * Get Ongoing Bookings Controller
 * Retrieves the count of currently active bookings for a seller
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing count of ongoing bookings
 */
export const getOngoingBookingsController = async (req, res) => {
    const userId = req.user._id;

    try {
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
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
    } catch (err) {
        console.log(`error in the getOngoingBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Get My Bids vs Other Sellers Average Controller
 * Compares the number of bids received by a seller in the last 7 days
 * against the average bids received by other sellers
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing bid comparison metrics
 */
export const getMyBidsVsOtherSellerAvgBidsController = async (req, res) => {
    const userId = req.user._id;

    const {startDate, endDate} = req.query;

    if(!startDate || !endDate){
        return res.status(400).json({ error: "startDate and endDate are required" });
    }

    try {

        const sellerBidsPipeline = [
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    'owner._id': userId,
                },
            },
            {
                $group: {
                    _id: null,
                    totalBids: { $sum: 1 },
                },
            },
        ];


        const otherSellersBidsPipeline = [
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                    'owner._id': { $ne: userId },
                },
            },
            {
                $group: {
                    _id: "$owner._id",
                    totalBids: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: null,
                    avgBids: { $avg: "$totalBids" },
                },
            },
            {
                $project: {
                    _id: 0,
                    avgBids: 1,
                },
            },
        ];


        const [sellerBids, otherSellersAvgBids] = await Promise.all([
            Bidding.aggregate(sellerBidsPipeline),
            Bidding.aggregate(otherSellersBidsPipeline),
        ]);


        const result = {
            sellerBids: sellerBids[0]?.totalBids || 0,
            otherSellersAvgBids: otherSellersAvgBids[0]?.avgBids || 0,
        };

        return res.status(200).json(result);
    } catch (err) {
        console.error(
            `Error in getMyBidsInLast7DaysVsOtherSellerAvgBidsController:`,
            err
        );
        return res
            .status(500)
            .json({ error: "An error occurred while processing the request." });
    }
};

/**
 * Get Car-wise Bookings Controller
 * Retrieves the number of bookings for each car owned by the seller
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing booking counts per car
 */
export const carWiseBookingsController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    if(!startDate && !endDate){
        return res.status(400).json({ error: "startDate and endDate are required" });
    }

        try {
            const aggregationPipeline = [
                {
                $match: {
                    'owner._id': userId,
                    status: { $in: ["approved", "started", "ended", "reviewed"] },
                        startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
    } catch (err) {
        console.log(`error in the carWiseBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Get Month-wise Bookings Controller
 * Retrieves the number of bookings per month for a seller
 * Can filter by current year or last year
 * 
 * @param {Object} req - Express request object containing year parameter
 * @param {string} req.query.year - 'thisYear' or 'lastYear' to filter bookings
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing monthly booking counts
 */
export const getMonthWiseBookingsController = async (req, res) => {

    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    try {
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status: { $in: ["approved", "started", "ended", "reviewed"] },
                    ...(startDate && endDate && {
                        startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    })
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


        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ monthWiseBookings: result });
    } catch (err) {
        console.log(`error in the getMonthWiseBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
};

/**
 * Get Month-wise Car Trips Controller
 * Calculates the total distance covered by cars in each month
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing monthly distance metrics
 */
export const monthWiseCarTripsController = async (req, res) => {
    const userId = req.user._id;

    try {
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
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
    } catch (err) {
        console.log(`error in the monthWiseCarTripsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Get Top 3 Cars with Most Earnings Controller
 * Retrieves the top 3 cars that have generated the highest revenue
 * Revenue calculation includes base amount and excess kilometer charges
 * 
 * @param {Object} req - Express request object containing date range
 * @param {string} req.query.startDate - Optional start date for filtering
 * @param {string} req.query.endDate - Optional end date for filtering
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing top 3 cars by revenue
 */
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
                    // Calculate booking duration in days
                    bookingDays: {
                        $divide: [
                            { $subtract: ["$endDate", "$startDate"] },
                            1000 * 60 * 60 * 24
                        ]
                    },
                    // Calculate kilometers driven
                    exceededKm: {
                        $max: [
                            0,
                            { $subtract: ["$endOdometerValue", "$startOdometerValue"] }
                        ]
                    },
                    // Calculate excess kilometer charges
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
                                },
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

/**
 * Get Top 3 Customers with Most Bookings Controller
 * Retrieves the top 3 customers who have made the most bookings with the seller
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing top 3 customers by booking count
 */
export const top3CostumersWithMostBookingsController = async (req, res) => {
    const userId = req.user._id;
    const {startDate, endDate} = req.query;
    if(!startDate || !endDate){
        return res.status(400).json({ error: "startDate and endDate are required" });
    }

    try {
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status: { $in: ["approved", "started", "ended", "reviewed"] },
                    startDate: { $gte: new Date(startDate), $lte: new Date(endDate)}
                }
            },
            {
                $group: {
                    _id: "$from.username",
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
    } catch (err) {
        console.log(`error in the top3CostumersWithMostBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Get Peak Bidding Hours Controller
 * Analyzes the distribution of bid creation times to identify peak bidding hours
 * 
 * @param {Object} req - Express request object containing date range
 * @param {string} req.query.startDate - Optional start date for filtering
 * @param {string} req.query.endDate - Optional end date for filtering
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing bid counts per hour
 */
export const peakBiddingHoursController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate);
    
    try {
        
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status: { $in: ["pending", "approved", "started", "ended", "reviewed"] } ,// Include all relevant statuses
                    ...(startDate && endDate && {
                        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    })
                }
            },
            {
                $group: {
                    _id: { 
                        $hour: { 
                            date: "$createdAt",
                            timezone: "Asia/Kolkata"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    hour: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ];
        
        const result = await Bidding.aggregate(aggregationPipeline);
        
        
        

        const allHours = Array.from({ length: 24 }, (_, i) => i);
        const completeResult = allHours.map(hour => {
            const existingHour = result.find(r => r.hour === hour);
            return existingHour || { hour, count: 0 };
        });
        
        return res.status(200).json({ 
            peakBiddingHours: completeResult,
            timeZone: "Asia/Kolkata" // Indicating the timezone used
        });
    } catch (err) {
        console.error(`Error in peakBiddingHoursController: ${err}`);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Get Negative Reviews Percentage Controller
 * Calculates the percentage of negative reviews (rating < 3) for a seller's vehicles
 * 
 * @param {Object} req - Express request object containing date range
 * @param {string} req.query.startDate - Optional start date for filtering
 * @param {string} req.query.endDate - Optional end date for filtering
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing negative review metrics
 */
export const getNegativeReviewsPercentageController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    if(!startDate || !endDate){
        return res.status(400).json({ error: "startDate and endDate are required" });
    }

    try {
        // Build date filter if dates are provided
        const matchFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
        };

        // Get count of negative reviews
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

        // Get total review count
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

        // Calculate percentage of negative reviews
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



/**
 * Get the average rental duration 
 * Calculates the average rental duration for a seller's vehicles
 * 
 * @param {Object} req - Express request object containing date range
 * @param {string} req.query.timePeriod - Optional time period for filtering

 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the average rental duration
 */
export const getAverageRentalDurationController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    try {
     
        
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status : { $in: [ "ended", "reviewed"] },
                    ...(startDate && endDate && {
                        endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    })
                }
            },
            {
                $addFields: {
                    bookingDays: {
                        $add: [
                            {
                                $divide: [
                                    { $subtract: ["$endDate", "$startDate"] },
                                    1000 * 60 * 60 * 24
                                ]
                            },
                            1
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    averageRentalDuration: { $avg: "$bookingDays" }
                }
            }
        ]
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({ averageRentalDuration: result });
    }catch(err){
        console.log(`error in the getAverageRentalDurationController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}

/**
 * Get Repeating Customer Percentage Controller
 * Calculates the percentage of repeating customers (customers who have made multiple bookings)
 * 
 * @param {Object} req - Express request object containing date range
 * 
 * @param {Object} res - Express response object
 * @returns {Object} JSON response containing the repeating customer percentage
 */
export const getRepeatingCustomerPercentageController = async (req, res) => {
    const userId = req.user._id;
    const {startDate, endDate} = req.query;

    try {
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status : {$in : [ "approved", "started", "ended","reviewed"]},
                    ...(startDate && endDate && {
                        startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                    })
                }
            },
            {
                $group : {
                    _id: '$from.username',
                    count: { $sum: 1 }
                }
            }
        ];



        // Execute the aggregation pipeline
        const customerBookingCounts = await Bidding.aggregate(aggregationPipeline);
        console.log(customerBookingCounts);

        
        // Count total unique customers
        const totalUniqueCustomers = customerBookingCounts.length;
        
        // Count repeating customers (customers with more than 1 booking)
        const repeatingCustomers = customerBookingCounts.filter(customer => customer.count > 1).length;
        
        // Calculate percentage of repeating customers
        const repeatingCustomerPercentage = totalUniqueCustomers > 0 
            ? (repeatingCustomers / totalUniqueCustomers) * 100 
            : 0;
            
        return res.status(200).json({
            repeatingCustomerPercentage,
            totalUniqueCustomers,
            repeatingCustomers,
        });
    } catch(err) {
        console.log(`error in the getRepeatingCustomerPercentageController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}
/**
 * Controller to get the total number of bookings for a seller
 * Can be filtered by date range through query parameters
 * Only counts bookings with status approved, started, ended or reviewed
 * 
 * @param {Object} req - Express request object containing:
 *   - user._id: ID of the authenticated seller
 *   - query.startDate: Optional start date for filtering
 *   - query.endDate: Optional end date for filtering
 * @param {Object} res - Express response object
 * @returns {Object} - Contains array with single result object having count of bookings
 */

export const numberOfBookingsController = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    try {
        const aggregationPipeline = [
            {
                $match: {
                    'owner._id': userId,
                    status: { $in: [ "approved", "started", "ended", "reviewed"] }
                }
            },{
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]
        if (startDate && endDate) {
           aggregationPipeline[0].$match.startDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }
        const result = await Bidding.aggregate(aggregationPipeline);
        return res.status(200).json({  result });
    }catch(err){
        console.log(`error in the numberOfBookingsController ${err}`);
        return res.status(400).json({ error: err.message });
    }
}
        

/**
 * Controller to get count of negative reviews (rating < 3) per car for a seller
 * Can be filtered by date range through query parameters
 * Groups reviews by car (company + name + model year)
 * Only includes reviews for cars owned by the authenticated seller
 * 
 * @param {Object} req - Express request object containing:
 *   - user._id: ID of the authenticated seller
 *   - query.startDate: Optional start date for filtering
 *   - query.endDate: Optional end date for filtering
 * @param {Object} res - Express response object
 * @returns {Object} - Contains array of car names and their negative review counts
 */

export const getCarWiseNegativeReviewsController = async (req, res) => {
    const userId = req.user._id; // Ensure userId is an ObjectId
    const { startDate, endDate } = req.query;

    try {
        const aggregationPipeline = [
            {
                $match: {
                    rating: { $lt: 3 } // Filter for negative reviews
                }
            },
            // Apply date filtering if both startDate and endDate are provided
            ...(startDate && endDate
                ? [{
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                }]
                : []
            ),
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle._id", 
                    foreignField: "_id",
                    as: "vehicleData"
                }
            },
            { $unwind: "$vehicleData" },
            {
                $match: {
                    "vehicleData.owner._id": userId 
                }
            },
            {
                $group: {
                    _id: {
                        $concat: [
                            { "$toLower": "$vehicleData.company" },
                            " ",
                            { "$toLower": "$vehicleData.name" },
                            " ",
                            { "$toString": "$vehicleData.modelYear" }
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ];

        const result = await Review.aggregate(aggregationPipeline);
        return res.status(200).json({ result });

    } catch (err) {
        console.error(`Error in getCarWiseNegativeReviewsController: ${err}`);
        return res.status(400).json({ error: err.message });
    }
};
