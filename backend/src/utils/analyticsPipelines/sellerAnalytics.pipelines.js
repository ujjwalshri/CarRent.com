import { Types } from "mongoose";

const kilometersLimit = 300;
const finePerKilometer = 10;

// Pipeline Definitions
export const pipelines = {
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

    negativeReviews: (userId, startDate, endDate) => ( // reviews having ratings less than 3
        [
            {
                $match : {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
            }
            },
            { $match: { "owner._id": userId, rating: { $lt: 3 } } },
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
            
            { $match: { "owner._id": userId } },
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
                },
                addonsTotal: {
                    $reduce: {
                        input: { $ifNull: ["$selectedAddons", []] },
                        initialValue: 0,
                        in: { $add: ["$$value", "$$this.price"] }
                    }
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
                            "$excessKilometers",
                            finePerKilometer
                        ]},
                        "$addonsTotal"
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalBookingRevenue" },
                totalFineCollected: { $sum: "$fine" },
                totalAddonsRevenue: { $sum: "$addonsTotal" },
                totalBookings: { $sum: 1 },
                averageRevenue: { $avg: "$totalBookingRevenue" }
            }
        }
    ]),

    popularCars: (userId, startDate, endDate) => ([ // getting cars with most bidings 
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
 
   
    negativeReviews: (userId, startDate, endDate) => ([ //  aggregation pipeline for getting the negative reviews for a seller grouped by vehicle names
        {
            $match: {
                rating: { $lt: 3 },
                'owner._id': userId,
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
            $group: {
                _id: {
                    $concat: [
                        { "$toLower": "$vehicle.company" },
                        " ",
                        { "$toLower": "$vehicle.name" },
                        " ",
                        { "$toString": "$vehicle.modelYear" }
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
    
    topEarningCars: (userId, startDate, endDate) => ([ // getting top 3 most earning cars
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
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
                startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
          $project: { // modifying the date format and extracting the city 
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
      ]),
      cityWiseEarnings: (userId, startDate, endDate) => ([
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
                },
                addonsRevenue: {
                    $sum: {
                        $map: {
                            input: "$selectedAddons",
                            as: "addon",
                            in: "$$addon.price"
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: "$vehicle.city",
                totalRevenue: {
                    $sum: {
                        $add: [
                            {
                                $add: [
                                    {
                                        $multiply: [
                                            { $add: ["$bookingDays", 1] },
                                            "$amount"
                                        ]
                                    },
                                    "$exceededKmCharge",
                                    "$addonsRevenue"
                                ]
                            }
                        ]
                    }
                }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
    ])
    ,
    priceRangeBookings: (userId, startDate, endDate) => ([
        {
          $match: {
            'owner._id': userId,
            status: { $in: ["approved", "started", "ended", "reviewed"] },
            startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
            'vehicle.price': { $ne: null }
          }
        },
        {
          $addFields: {
            price: "$vehicle.price"
          }
        },
        {
          $addFields: {
            priceBucketStart: {
              $multiply: [{ $floor: { $divide: ["$price", 1000] } }, 1000]
            }
          }
        },
        {
          $addFields: {
            priceBucketEnd: { $add: ["$priceBucketStart", 1000] }
          }
        },
        {
          $group: {
            _id: {
              start: "$priceBucketStart",
              end: "$priceBucketEnd"
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            priceRange: {
              $concat: [
                { $toString: "$_id.start" },
                "-",
                { $toString: "$_id.end" }
              ]
            },
            count: 1
          }
        },
        {
          $sort: { priceRange: 1 }
        }
      ]),
      priceRangeWiseAverageRating: (userId, startDate, endDate) => ([
        {
          $match: {
            'owner._id': userId,
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            'vehicle.price': { $ne: null }
          }
        },
        {
          $addFields: {
            price: "$vehicle.price"
          }
        },
        {
          $addFields: {
            priceBucketStart: {
              $multiply: [{ $floor: { $divide: ["$price", 1000] } }, 1000]
            }
          }
        },
        {
          $addFields: {
            priceBucketEnd: { $add: ["$priceBucketStart", 1000] }
          }
        },
        {
          $group: {
            _id: {
              start: "$priceBucketStart",
              end: "$priceBucketEnd"
            },
            averageRating: { $avg: "$rating" },
            count : { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            priceRange: {
              $concat: [
                { $toString: "$_id.start" },
                "-",
                { $toString: "$_id.end" }
              ]
            },
            averageRating: 1,
            count : 1
          }
        },
        {
          $sort: { priceRange: 1 }
        }
      ]),
      averageRatingByFuelType: (userId, startDate, endDate) => ([
        {
            $match: {
                'owner._id': userId,
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: "$vehicle.fuelType",
                averageRating: { $avg: "$rating" }
            }
        },
        {
            $project: {
                _id: 0,
                fuelType: "$_id",
                averageRating: { $round: ["$averageRating", 2] }
            }
        }
      ])
      
};