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
 * Helper function to handle controller response
 * @param {Object} res - Express response object or custom handler
 * @param {number} status - HTTP status code
 * @param {Object} data - Response data
 */ 
const handleResponse = (res, status, data) => {
    if (typeof res.json === 'function') {
        return res.status(status).json(data);
    }
    return res.json(data);
};

// Pipeline Definitions
const pipelines = {
    // Overview Analytics Pipelines
    carDescription: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: "approved",
                createdAt: {
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
    ]),

    negativeReviews: (userId, startDate, endDate) => (
        [
            {
                $match : {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
            }
            },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle._id",
                    foreignField: "_id",
                    as: "vehicleData"
                }
            },
            { $unwind: "$vehicleData" },
            { $match: { "vehicleData.owner._id": userId, rating: { $lt: 3 } } },
            { $count: "negativeCount" }
        ]
    ),

    totalReviews: (userId) => (
        [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
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
        ]
    ),

    cityWiseBookings: (userId, startDate, endDate) => (
        [
            {
                $match: {
                    'owner._id' : userId,
                    status : { $in: ["approved", "started", "ended", "reviewed"] },
                    startDate : {
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
        ]
    ),
    totalRevenue: (userId, startDate, endDate) => ([
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
                baseAmount: { $multiply: ["$amount", { $add: ["$numberOfDays", 1] }] },
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
    ]),

    popularCars: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                createdAt: {
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
    ]),

    // Performance Analytics Pipelines
    carWiseBookings: (userId, startDate, endDate) => ([
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
    ]),
    repeatingCustomersPercentage: (userId, startDate, endDate) => (
        [
            {
              $match: {
                'owner._id': userId,
                status: { $in: ['approved', 'started', 'ended', 'reviewed'] },
                  startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
              },
            },
            {
              $group: {
                _id: '$from.username',
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: null,
                totalUniqueCustomers: { $sum: 1 },
                repeatingCustomers: {
                  $sum: {
                    $cond: [{ $gt: ['$count', 1] }, 1, 0],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalUniqueCustomers: 1,
                repeatingCustomers: 1,
                repeatingCustomerPercentage: {
                  $cond: [
                    { $gt: ['$totalUniqueCustomers', 0] },
                    {
                      $multiply: [
                        { $divide: ['$repeatingCustomers', '$totalUniqueCustomers'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          ]
    ),
    nagativeReviewsCount: (userId, startDate, endDate) => (

        [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle._id",
                    foreignField: "_id",
                    as: "vehicleData"
                }
            },
            { $unwind: "$vehicleData" },
            { $match: { "vehicleData.owner._id": userId, rating: { $lt: 3 } } },
            { $count: "negativeCount" }
        ]
    ),

    totalReviewsCount: (userId, startDate, endDate) => (
        [
            {
                $match: {
                    'owner._id': userId,
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $lookup: {
                    from: "vehicles",
                    localField: "vehicle._id",
                    foreignField: "_id",
                    as: "vehicleData"
                }
            },
            { $unwind: "$vehicleData" }, 
            { $match: { "vehicleData.owner._id": userId } },
            { $count: "totalCount" }
        ]
    ),  
    negativeReviews: (userId, startDate, endDate) => ([
        {
            $match: {
                rating: { $lt: 3 }
            }
        },
        {
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
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
    ]),
    sellerBids: (userId, startDate, endDate) => (
        [
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
        ]
    ),
    otherSellersAvgBids: (userId, startDate, endDate) => (
        [
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
        ]
    )   ,      
    
    topEarningCars: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["ended", "reviewed"] },
                ...(startDate && endDate && {
                    updatedAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                })
            }
        },
        {
            $addFields: {
                bookingDays: {
                    $divide: [
                        { $subtract: ["$endDate", "$startDate"] },
                        1000 * 60 * 60 * 24
                    ]
                },
                exceededKm: {
                    $max: [
                        0,
                        { $subtract: ["$endOdometerValue", "$startOdometerValue"] }
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
                            },
                            "$exceededKmCharge"
                        ]
                    }
                }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 3 }
    ]),

    // Booking Analytics Pipelines
    peakHours: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["pending", "approved", "started", "ended", "reviewed"] },
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
    ]),

    monthlyBookings: (userId, startDate, endDate) => ([
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
    ]),

    topCustomers: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["approved", "started", "ended", "reviewed"] },
                startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
    ]),
    averageRentalDuration: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status : { $in: [ "ended", "reviewed"] },
                endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
    ])
};

/**
 * Get Overview Analytics
 * Consolidates overview-related analytics including revenue, bookings, and car stats
 */
export const getOverviewAnalytics = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    try {
        const [revenueData, carDescriptionData, popularCarsData, nagativeReviewsCountData, totalReviewsCountData] = await Promise.all([
            Bidding.aggregate(pipelines.totalRevenue(userId, startDate, endDate)),
            Vehicle.aggregate(pipelines.carDescription(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.popularCars(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.nagativeReviewsCount(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.totalReviewsCount(userId, startDate, endDate))
        ]);

        return handleResponse(res, 200, {
            revenue: revenueData[0] || null,
            carDescription: { suvVsSedan: carDescriptionData },
                popularCars: { top3MostPopularCars: popularCarsData },
            nagativeReviewsCount: { nagativeReviewsCount: nagativeReviewsCountData },
            totalReviewsCount: { totalReviewsCount: totalReviewsCountData }
        });
    } catch (error) {
        console.error('Error in getOverviewAnalytics:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch overview analytics' });
    }
};

/**
 * Get Performance Analytics
 * Consolidates performance-related analytics including reviews, earnings, and car performance
 */
export const getPerformanceAnalytics = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    try {
        const [carPerformanceData, negativeReviewsData, topEarningCarsData] = await Promise.all([
            Bidding.aggregate(pipelines.carWiseBookings(userId, startDate, endDate)),
            Review.aggregate(pipelines.negativeReviews(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.topEarningCars(userId, startDate, endDate))
        ]);

        return handleResponse(res, 200, {
            carPerformance: { carWiseBookings: carPerformanceData },
            negativeReviews: { result: negativeReviewsData },
            topEarningCars: { top3CarsWithMostEarning: topEarningCarsData }
        });
    } catch (error) {
        console.error('Error in getPerformanceAnalytics:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch performance analytics' });
    }
};

/**
 * Get Booking Analytics
 * Consolidates booking-related analytics including patterns, customer data, and trends
 */
export const getBookingAnalytics = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    try {
        const [peakHoursData, monthlyBookingsData, topCustomersData, averageRentalDurationData, repeatingCustomersPercentageData, cityWiseBookingsData, sellerBidsData, otherSellersAvgBidsData] = await Promise.all([
            Bidding.aggregate(pipelines.peakHours(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.monthlyBookings(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.topCustomers(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.averageRentalDuration(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.repeatingCustomersPercentage(userId, startDate, endDate)), 
            Bidding.aggregate(pipelines.cityWiseBookings(userId, startDate, endDate)), 
            Bidding.aggregate(pipelines.sellerBids(userId, startDate, endDate)),
            Bidding.aggregate(pipelines.otherSellersAvgBids(userId, startDate, endDate))
        ]);

        // Process peak hours data to include all 24 hours
        const allHours = Array.from({ length: 24 }, (_, i) => i);
        const completeHoursData = allHours.map(hour => {
            const existingHour = peakHoursData.find(r => r.hour === hour);
            return existingHour || { hour, count: 0 };
        });

        return handleResponse(res, 200, {
            peakHours: { 
                peakBiddingHours: completeHoursData,
                timeZone: "Asia/Kolkata"
            },
            monthlyBookings: { monthWiseBookings: monthlyBookingsData },
            topCustomers: { top3CostumersWithMostBookings: topCustomersData },
            averageRentalDuration: { averageRentalDuration: averageRentalDurationData },
            repeatingCustomersPercentage: { repeatingCustomersPercentage: repeatingCustomersPercentageData }, 
            cityWiseBookings: { cityWiseBookings: cityWiseBookingsData },
            sellerBids: { sellerBids: sellerBidsData },
            otherSellersAvgBids: { otherSellersAvgBids: otherSellersAvgBidsData }
        });
    } catch (error) {
        console.error('Error in getBookingAnalytics:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch booking analytics' });
    }
};
