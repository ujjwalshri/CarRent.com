
/**
 * Seller Analytics Controller
 * This controller handles all analytics-related operations for sellers including revenue calculations,
 * booking statistics, and performance metrics.
 */

import Vehicle from "../models/vehicle.model.js";
import Bidding from "../models/bidding.model.js";
import Review from "../models/review.model.js";
import { getCachedData, setCachedData } from "../services/redis.service.js";
import { Types } from "mongoose";


/**
 * Helper function to handle controller response
 * @param {Object} res - Express response object or custom handler
 * @param {number} status - HTTP status code
 * @param {Object} data - Response data
 */ 
const handleResponse = (res, status, data) => {
        return res.status(status).json(data);
};

const kilometersLimit = 300;
const finePerKilometer = 10;
// Pipeline Definitions
const pipelines = {
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
           $project : {
               category : 1
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
              $project : {
                vehicle : 1
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
                        { $subtract: ["$kilometersDriven", kilometersLimit] },
                        0
                    ]
                }
            }
        },
        {
            $addFields: {
                fine: {
                    $multiply: ["$excessKilometers", finePerKilometer]
                },
                totalBookingRevenue: {
                    $add: [
                        "$baseAmount",
                        { $multiply: [
                            { $max: [
                                { $subtract: ["$kilometersDriven", kilometersLimit] },
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
        $project: { 
            vehicle: {
                company: { $toLower: "$vehicle.company" },
                name: { $toLower: "$vehicle.name" },
                modelYear: "$vehicle.modelYear"
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
           $project : {
                vehicle : {
                     company: { $toLower: "$vehicle.company" },
                     name: { $toLower: "$vehicle.name" },
                     modelYear: "$vehicle.modelYear"
                }
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
               $project: {
                from: {
                    username: "$from.username",
                    _id: "$from._id",
                },
            }
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
    otherSellersAvgBids: (userId, startDate, endDate) => ([
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
    ]),
    
    myEarningVsOtherSellersAvgEarnings: (userId, startDate, endDate) => ([
        {
            $facet: {
                myEarnings: [
                    {
                        $match: {
                            'owner._id': userId,
                            status: { $in: ["ended", "reviewed"] },
                            endDate: {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate)
                            }
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
                            exceededKmCharge: {
                                $multiply: [
                                    {
                                        $max: [
                                            0,
                                            { $subtract: [{ $subtract: ["$endOdometerValue", "$startOdometerValue"] }, kilometersLimit] }
                                        ]
                                    },
                                    finePerKilometer
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
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
                    }
                ],
                otherSellersEarnings: [
                    {
                        $match: {
                            'owner._id': { $ne: userId },
                            status: { $in: ["ended", "reviewed"] },
                            endDate: {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate)
                            }
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
                            exceededKmCharge: {
                                $multiply: [
                                    {
                                        $max: [
                                            0,
                                            { $subtract: [{ $subtract: ["$endOdometerValue", "$startOdometerValue"] }, kilometersLimit] }
                                        ]
                                    },
                                    finePerKilometer
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$owner._id",
                            sellerRevenue: {
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
                    {
                        $group: {
                            _id: null,
                            avgRevenue: { $avg: "$sellerRevenue" }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                myEarnings: { $ifNull: [{ $arrayElemAt: ["$myEarnings.totalRevenue", 0] }, 0] },
                otherSellersAvgEarnings: { $ifNull: [{ $arrayElemAt: ["$otherSellersEarnings.avgRevenue", 0] }, 0] }
            }
        }
    ]),
    
    topEarningCars: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["ended", "reviewed"] },
                endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
                                { $subtract: [{ $subtract: ["$endOdometerValue", "$startOdometerValue"] }, kilometersLimit] }
                            ]
                        },
                        finePerKilometer
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
                        { $toLower: "$vehicle.name" },
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
                        timezone: "Asia/Kolkata" // timezone for india
                    }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 } // sort by hour
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
                status : { $in: ["approved", "started", "ended", "reviewed"] },
                startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $project: {
                startDate: 1,
                endDate: 1
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
    ]),
    totalRevenueByAddons: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["approved", "started", "ended", "reviewed"] },
                endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $project: {
                selectedAddons: 1,
            }
        },
        {
            $unwind: "$selectedAddons"
        },
        {
            $group: {
                _id: "$selectedAddons",
                totalAmount: { $sum: "$selectedAddons.price" }
            }
        }
    ]),
    averageBidCostPerRental: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["approved", "started", "ended", "reviewed"] },
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $project: {
                amount: 1
            }
        },
        {
            $group: {
                _id: null,
                averageCostPerRental: { $avg: "$amount" }
            }
        }
    ]),
    averageBookingPayment: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["ended", "reviewed"] },
                endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $addFields: {
                // Calculate number of days (endDate - startDate + 1)
                numberOfDays: {
                    $add: [
                        {
                            $dateDiff: {
                                startDate: "$startDate",
                                endDate: "$endDate",
                                unit: "day"
                            }
                        },
                        1
                    ]
                },
                // Calculate extra kilometers charge if applicable
                extraKmCharge: {
                    $cond: {
                        if: {
                            $gt: [
                                { $subtract: ["$endOdometerValue", "$startOdometerValue"] },
                                300
                            ]
                        },
                        then: {
                            $multiply: [
                                { 
                                    $subtract: [
                                        { $subtract: ["$endOdometerValue", "$startOdometerValue"] },
                                        300
                                    ]
                                },
                                10 // $10 per extra km
                            ]
                        },
                        else: 0
                    }
                },
                // Calculate total addons amount
                addonsTotal: {
                    $reduce: {
                        input: "$selectedAddons",
                        initialValue: 0,
                        in: { $add: ["$$value", "$$this.price"] }
                    }
                }
            }
        },
        {
            $addFields: {
                // Calculate total payment for each booking
                totalPayment: {
                    $add: [
                        { $multiply: ["$amount", "$numberOfDays"] }, // Base amount * days
                        "$extraKmCharge", // Extra km charges
                        "$addonsTotal" // Addons total
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                averageBookingPayment: { $avg: "$totalPayment" },
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: "$totalPayment" }
            }
        },
        {
            $project: {
                _id: 0,
                averageBookingPayment: { $round: ["$averageBookingPayment", 2] },
                totalBookings: 1,
                totalRevenue: { $round: ["$totalRevenue", 2] }
            }
        }
    ]),
    selectedAddonsCount : (userId, startDate, endDate)=> ([
        {
            $match: {
                'owner._id': userId,
                status: { $in: ["approved", "started", "ended", "reviewed"] },
                startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $project: {
                selectedAddons: 1
            }
        },
        {
            $unwind: "$selectedAddons"
        },
        {
            $group: {
                _id: "$selectedAddons.name", 
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        {
            $limit: 5
        }
    ]),
    sellerRating: (sellerId) => ([
        {
          $match: {
            'owner._id': { $exists: true, $eq: new Types.ObjectId(String(sellerId)) }
          }
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" }
          }
        }
      ])
      ,
      topCitiesWithMostNegativeReviews: (sellerId, startDate, endDate) => ([
        {
          $match: {
            'owner._id': { $exists: true, $eq: new Types.ObjectId(String(sellerId)) },
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            rating: { $lt: 3 } 
          }
        },
        {
          $project: {
            city: "$vehicle.city",
            createdAt: 1
          }
        },
        {
          $project: {
            city: 1,
            createdAt: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } 
            }
          }
        },
        {
          $group: {
            _id: { city: "$city", date: "$createdAt" }, 
            count: { $sum: 1 }  
          }
        },
        {
          $group: {
            _id: "$_id.city",  
            reviewCounts: {
              $push: { 
                date: "$_id.date", 
                count: "$count" 
              }
            }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5 
        }
      ])
};

// Individual API Endpoints for Overview Analytics
export const getTotalRevenue = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-revenue-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const revenueData = await Bidding.aggregate(pipelines.totalRevenue(userId, startDate, endDate));
        await setCachedData(cacheKey, { revenue: revenueData[0] || null });
        return handleResponse(res, 200, { revenue: revenueData[0] || null });
    } catch (error) {
        console.error('Error in getTotalRevenue:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch revenue data' });
    }
};

export const getCarDescription = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-car-description-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const carDescriptionData = await Vehicle.aggregate(pipelines.carDescription(userId, startDate, endDate));
        await setCachedData(cacheKey, { carDescription: { suvVsSedan: carDescriptionData } });
        return handleResponse(res, 200, { carDescription: { suvVsSedan: carDescriptionData } });
    } catch (error) {
        console.error('Error in getCarDescription:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch car description data' });
    }
};

export const getPopularCars = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-popular-cars-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

     try {
        const popularCarsData = await Bidding.aggregate(pipelines.popularCars(userId, startDate, endDate));
        await setCachedData(cacheKey, { popularCars: { top3MostPopularCars: popularCarsData } });
        return handleResponse(res, 200, { popularCars: { top3MostPopularCars: popularCarsData } });
    } catch (error) {
        console.error('Error in getPopularCars:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch popular cars data' });
    }
};

// Individual API Endpoints for Performance Analytics
export const getCarWiseBookings = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-car-wise-bookings-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const carPerformanceData = await Bidding.aggregate(pipelines.carWiseBookings(userId, startDate, endDate));
        await setCachedData(cacheKey, { carPerformance: { carWiseBookings: carPerformanceData } });
        return handleResponse(res, 200, { carPerformance: { carWiseBookings: carPerformanceData } });
    } catch (error) {
        console.error('Error in getCarWiseBookings:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch car-wise bookings data' });
    }
};

export const getNegativeReviews = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-negative-reviews-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const negativeReviewsData = await Review.aggregate(pipelines.negativeReviews(userId, startDate, endDate));
        await setCachedData(cacheKey, { negativeReviews: { result: negativeReviewsData } });
        return handleResponse(res, 200, { negativeReviews: { result: negativeReviewsData } });
    } catch (error) {
        console.error('Error in getNegativeReviews:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch negative reviews data' });
    }
};

export const getTopEarningCars = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-top-earning-cars-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const topEarningCarsData = await Bidding.aggregate(pipelines.topEarningCars(userId, startDate, endDate));
        await setCachedData(cacheKey, { topEarningCars: { top3CarsWithMostEarning: topEarningCarsData } });
        return handleResponse(res, 200, { topEarningCars: { top3CarsWithMostEarning: topEarningCarsData } });
    } catch (error) {
        console.error('Error in getTopEarningCars:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch top earning cars data' });
    }
};

// Individual API Endpoints for Booking Analytics
export const getPeakHours = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-peak-hours-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const peakHoursData = await Bidding.aggregate(pipelines.peakHours(userId, startDate, endDate));
        const completeHoursData = Array.from({ length: 24 }, (_, i) => {
            const existingHour = peakHoursData.find(r => r.hour === i);
            return existingHour || { hour: i, count: 0 };
        });
        await setCachedData(cacheKey, { peakHours: { peakBiddingHours: completeHoursData, timeZone: "Asia/Kolkata" } });
        return handleResponse(res, 200, { peakHours: { peakBiddingHours: completeHoursData, timeZone: "Asia/Kolkata" } });
    } catch (error) {
        console.error('Error in getPeakHours:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch peak hours data' });
    }
};

export const getMonthlyBookings = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-monthly-bookings-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const monthlyBookingsData = await Bidding.aggregate(pipelines.monthlyBookings(userId, startDate, endDate));
        await setCachedData(cacheKey, { monthlyBookings: { monthWiseBookings: monthlyBookingsData } });
        return handleResponse(res, 200, { monthlyBookings: { monthWiseBookings: monthlyBookingsData } });
    } catch (error) {
        console.error('Error in getMonthlyBookings:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch monthly bookings data' });
    }
};

export const getTopCustomers = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-top-customers-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const topCustomersData = await Bidding.aggregate(pipelines.topCustomers(userId, startDate, endDate));
        await setCachedData(cacheKey, { topCustomers: { top3CostumersWithMostBookings: topCustomersData } });
        return handleResponse(res, 200, { topCustomers: { top3CostumersWithMostBookings: topCustomersData } });
    } catch (error) {
        console.error('Error in getTopCustomers:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch top customers data' });
    }
};

export const getAverageRentalDuration = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-avg-rental-duration-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const avgRentalDurationData = await Bidding.aggregate(pipelines.averageRentalDuration(userId, startDate, endDate));
        await setCachedData(cacheKey, { averageRentalDuration: { averageRentalDuration: avgRentalDurationData } });
        return handleResponse(res, 200, { averageRentalDuration: { averageRentalDuration: avgRentalDurationData } });
    } catch (error) {
        console.error('Error in getAverageRentalDuration:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch average rental duration data' });
    }
};

export const getRepeatingCustomersPercentage = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-repeating-customers-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const repeatingCustomersData = await Bidding.aggregate(pipelines.repeatingCustomersPercentage(userId, startDate, endDate));
        await setCachedData(cacheKey, { repeatingCustomersPercentage: { repeatingCustomersPercentage: repeatingCustomersData } });
        return handleResponse(res, 200, { repeatingCustomersPercentage: { repeatingCustomersPercentage: repeatingCustomersData } });
    } catch (error) {
        console.error('Error in getRepeatingCustomersPercentage:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch repeating customers percentage data' });
    }
};

export const getCityWiseBookings = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-city-wise-bookings-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const cityWiseBookingsData = await Bidding.aggregate(pipelines.cityWiseBookings(userId, startDate, endDate));
        await setCachedData(cacheKey, { cityWiseBookings: { cityWiseBookings: cityWiseBookingsData } });
        return handleResponse(res, 200, { cityWiseBookings: { cityWiseBookings: cityWiseBookingsData } });
    } catch (error) {
        console.error('Error in getCityWiseBookings:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch city-wise bookings data' });
    }
};

// Individual API Endpoints for Comparison Analytics
export const getBiddingComparison = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-bidding-comparison-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const [myBidsData] = await Bidding.aggregate(pipelines.sellerBids(userId, startDate, endDate));
        const [otherSellersData] = await Bidding.aggregate(pipelines.otherSellersAvgBids(userId, startDate, endDate));

        const biddingComparison = {
            myBids: myBidsData?.totalBids || 0,
            otherSellersAvgBids: otherSellersData?.avgBids || 0
        };

        await setCachedData(cacheKey, { biddingComparison: { biddingComparison } });
        return handleResponse(res, 200, { biddingComparison: { biddingComparison } });
    } catch (error) {
        console.error('Error in getBiddingComparison:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch bidding comparison data' });
    }
};

export const getEarningComparison = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-earning-comparison-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const [comparisonData] = await Bidding.aggregate(pipelines.myEarningVsOtherSellersAvgEarnings(userId, startDate, endDate));
        
        const earningComparison = {
            myEarnings: comparisonData?.myEarnings || 0,
            otherSellersAvgEarnings: comparisonData?.otherSellersAvgEarnings || 0
        };

        await setCachedData(cacheKey, { earningComparison: { earningComparison } });
        return handleResponse(res, 200, { earningComparison: { earningComparison } });
    } catch (error) {
        console.error('Error in getEarningComparison:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch earning comparison data' });
    }
};


export const getTotalRevenueByAddons = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-total-revenue-by-addons-${userId}-${startDate}-${endDate}`; // Cache key for total revenue by addons
    const cachedData = await getCachedData(cacheKey); // Check if data is cached
    if (cachedData) {
        return handleResponse(res, 200, cachedData); // Return cached data if available
    }

    try {
        const totalRevenueByAddonsData = await Bidding.aggregate(pipelines.totalRevenueByAddons(userId, startDate, endDate));
        await setCachedData(cacheKey, { totalRevenueByAddons: { totalRevenueByAddons: totalRevenueByAddonsData } });
        return handleResponse(res, 200, { totalRevenueByAddons: { totalRevenueByAddons: totalRevenueByAddonsData } });
    } catch (error) {
        console.error('Error in getTotalRevenueByAddons:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch total revenue by addons data' });
    }
};


/**
 * @description Get the average cost per rental for the seller
 * @param {Object} req - The request object
 * @param {Object} req.user - The user object
 * @param {string} req.user._id - The user id
 * @param {string} req.query.startDate - The start date
 * @param {string} req.query.endDate - The end date
 * @returns {Object} The average cost per rental data
 */
export const getAverageBidCostPerRental = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-average-cost-per-rental-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const averageCostPerRentalData = await Bidding.aggregate(pipelines.averageBidCostPerRental(userId, startDate, endDate));
        await setCachedData(cacheKey, { averageCostPerRental: { averageCostPerRental: averageCostPerRentalData } });
        return handleResponse(res, 200, { averageCostPerRental: { averageCostPerRental: averageCostPerRentalData } });
    } catch (error) {
        console.error('Error in getAverageCostPerRental:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch average cost per rental data' });
    }
};

export const getAverageBookingPayment = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-average-booking-payment-${userId}-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

    try {
        const averageBookingPaymentData = await Bidding.aggregate(pipelines.averageBookingPayment(userId, startDate, endDate));
        await setCachedData(cacheKey, { averageBookingPayment: { averageBookingPayment: averageBookingPaymentData } });
        return handleResponse(res, 200, { averageBookingPayment: { averageBookingPayment: averageBookingPaymentData } });
    } catch (error) {
        console.error('Error in getAverageBookingPayment:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch average booking payment data' });
    }
};

export const getSelectedAddonsCount = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    try {
        const selectedAddonsCountData = await Bidding.aggregate(pipelines.selectedAddonsCount(userId, startDate, endDate));
        return handleResponse(res, 200, { selectedAddonsCount: { selectedAddonsCount: selectedAddonsCountData } });
    } catch (error) {
        console.error('Error in getSelectedAddonsCount:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch selected addons count data' });
    }
};


/**
 * @description Get the seller rating
 * @param {Object} req - The request object
 * @param {Object} req.params - The params object
 * @param {string} req.params.id - The seller id
 * @returns {Object} The seller rating data
 */
export const getSellerRating = async (req, res)=>{
    const sellerId = req.params.id;
    if(!sellerId){
        return handleResponse(res, 400, {error: "sellerId is required"});
    }
    try {
        const sellerRatingData = await Review.aggregate(pipelines.sellerRating(sellerId));
        return handleResponse(res, 200, {sellerRating:  sellerRatingData});
    } catch (error) {
        console.error('Error in getSellerRating:', error);
        return handleResponse(res, 500, {error: 'Failed to fetch seller rating data'});
    }
}


/**
 * Controller function to get the top cities with most negative reviews for a seller
 * @param {*} req  - The request object
 * @param {*} res - The response object
 * @returns returns the top cities with most negative reviews for a seller
 */
export const topCitiesWithMostNegativeReviews = async (req, res)=>{
    const sellerId = req.user._id;
    const { startDate, endDate } = req.query;
    if(!sellerId){
        return handleResponse(res, 400, {error: "sellerId is required"});
    }
    try {
        const topCitiesWithMostNegativeReviewsData = await Review.aggregate(pipelines.topCitiesWithMostNegativeReviews(sellerId, startDate, endDate));
        return handleResponse(res, 200, topCitiesWithMostNegativeReviewsData );
    } catch (error) {
        console.error('Error in getTopCitiesWithMostNegativeReviews:', error);
        return handleResponse(res, 500, {error: 'Failed to fetch top cities with most negative reviews data'});
    }
}