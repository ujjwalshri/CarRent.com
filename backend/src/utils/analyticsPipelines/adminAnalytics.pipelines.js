// filepath: /Users/ujjwalshrivastava23icloud.com/Desktop/CarRentalGithub/backend/src/aggregationPipelines/adminAnalytics.pipelines.js

// Constants for business logic
const kilometersLimit = 300; // Constant for kilometers limit
const finePerKilometer = 10; // Constant for fine per kilometer

// Pipeline Definitions
export const pipelines = {
    // Car Description Statistics
    carDescription: (startDate, endDate) => ([
        {
            $match: {
                status: 'approved',
                deleted: false,
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

    // Top 10 Popular Car Models
    top10PopularCarModels: (startDate, endDate) => ([
        {
            $match: {
                startDate: {
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
            $sort: {count: -1}
        },
        {
            $limit: 10
        }
    ]),

    // Top 3 Most Reviewed Cars
    top3MostReviewedCars: (startDate, endDate) => ([
        {
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                },
                rating: { $gte: 3 } // Only include reviews with rating >= 3 (positive ratings)
            }
        },
        {
           $project : {
            vehicle : {
                company : 1,
                name : { $toLower: "$vehicle.name" },
                modelYear : 1
            },
            rating: 1 
           }
        },
        {
            $group: {
                _id: { $concat: ["$vehicle.company", " ", "$vehicle.name", " ", { "$toString": "$vehicle.modelYear" }] },
                count: { $sum: 1 },
                averageRating: { $avg: "$rating" } // Calculate average positive rating as well
            }
        },
        {
            $sort: { count: -1 } // Sort by number of positive reviews
        },
        {
            $limit: 3
        }
    ]),

    // Top 3 Owners with Most Cars
    top3OwnersWithMostCars: (startDate, endDate) => ([
        {
            $match: {
                status: 'approved',
                deleted: false,
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
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
    ]),

    // Biddings Per City
    biddingsPerCity: (startDate, endDate) => ([
        {
            $match: {
                createdAt: {
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
    ]),

    // User Growth Statistics
    userGrowth: (startDate, endDate) => ([
        { 
            $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        },
        {
         $group : {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
         }
        }, 
        { 
            $sort: { _id: 1 } 
        } 
    ]),

    // Highest Earning Cities
    highestEarningCities: (startDate, endDate) => ([
        { 
            $match:  {
                status: { $in: ["ended", "reviewed"] },
                endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
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
                    $max: [{ $subtract: ["$kilometersDriven", kilometersLimit] }, 0]
                }
            }
        },
        {
            $addFields: {
                fine: { $multiply: ["$excessKilometers", finePerKilometer] },
                totalBookingRevenue: {
                    $add: ["$baseAmount", { $multiply: ["$excessKilometers", finePerKilometer] }]
                }
            }
        },
        {
            $group: {
                _id: "$vehicle.city",
                totalEarnings: { $sum: "$totalBookingRevenue" }
            }
        },
        { $sort: { totalEarnings: -1 } },
        { $limit: 5 }
    ]),

    // General Analytics
    generalAnalytics: (startDate, endDate) => ({
        totalBlockedUsers: [
            { 
                $match: { isBlocked: true } 
            },
            { 
                $count: "count" 
            }
        ],
        
        ongoingBookings: [
            { 
                $match: { status: "started" } 
            },
            { 
                $group: { _id: null, count: { $sum: 1 } } 
            }
        ],
        
        averageBookingDuration: [
            {
                $match: {
                    status: { $in: ["approved", "started", "ended", "reviewed"] },
                    startDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
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
        ],
        
        totalUsers: [
            { 
                $count: "count" 
            }
        ],
        
        userEngagement: [
            {
                $group: {
                    _id: "$from.username",
                    count: { $sum: 1 }
                }
            }
        ]
    }),

    // Overview Statistics
    overviewStats: (startDate, endDate) => ({
        biddingConversionRate: [
            {
                $match: {
                    startDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
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
        ],
        
        newUsers: [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    sum: 1
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]
    }),

    // Top Performers
    topPerformers: (startDate, endDate) => ({
        topSellers: [
            {
                $match: {
                    status: { $in: ["ended", "reviewed"] },
                    endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $addFields: {
                    // Calculate number of days for each booking
                    numberOfDays: {
                        $ceil: {
                            $divide: [
                                { $subtract: ["$endDate", "$startDate"] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    },
                    // Calculate kilometers driven
                    kilometersDriven: {
                        $subtract: ["$endOdometerValue", "$startOdometerValue"]
                    }
                }
            },
            {
                $addFields: {
                    // Calculate base amount (price per day * number of days)
                    baseAmount: { $multiply: ["$amount", { $add: ["$numberOfDays", 1] }] },
                    // Calculate excess kilometers (above limit)
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
                    // Calculate fine for excess kilometers
                    fine: { $multiply: ["$excessKilometers", finePerKilometer] },
                    // Calculate total revenue (base amount + fines)
                    totalBookingRevenue: {
                        $add: [
                            "$baseAmount",
                            { $multiply: [
                                { $max: [
                                    { $subtract: ["$kilometersDriven", kilometersLimit] },
                                    0
                                ]},
                                finePerKilometer
                            ]}
                        ]
                    }
                }
            },
            {
                // Group by owner to calculate total earnings per seller
                $group: {
                    _id: "$owner._id",
                    ownerUsername: { $first: "$owner.username" },
                    ownerEmail: { $first: "$owner.email" },
                    ownerFirstName: { $first: "$owner.firstName" },
                    ownerLastName: { $first: "$owner.lastName" },
                    totalEarnings: { $sum: "$totalBookingRevenue" },
                    totalFine: { $sum: "$fine" }
                }
            },
            {
                $sort: { totalEarnings: -1 } // Sort by earnings in descending order
            },
            {
                $limit: 10 // Limit to top 10 sellers
            }
        ],

        topBuyers: [
            { 
                $match: {
                    status: { $in: ["approved", "started", "ended", "reviewed"] },
                    startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                // Group by buyer to count bookings per person
                $group: {
                    _id: "$from._id",
                    buyerUsername: { $first: "$from.username" },
                    buyerEmail: { $first: "$from.email" },
                    buyerFirstName: { $first: "$from.firstName" },
                    buyerLastName: { $first: "$from.lastName" },
                    buyerCity: { $first: "$from.city" },
                    count: { $sum: 1 } // Count bookings per buyer
                }
            },
            {
                $sort: { count: -1 } // Sort by booking count in descending order
            },
            {
                $limit: 10 // Limit to top 10 buyers
            }
        ]
    }),

    // Customer Satisfaction Score
    customerSatisfaction: (startDate, endDate) => ([
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: null,
                numberOfCustomersWithReviews: { $sum: 1 },
                numberOfSatisfiedCustomers: {
                    $sum: {
                        $cond: [
                            { $gte: ["$rating", 3] }, // Consider rating >= 3 as "satisfied"
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
                numberOfCustomersWithReviews: 1,
                numberOfSatisfiedCustomers: 1,
                customerSatisfactionScore: {
                    $cond: [
                        { $eq: ["$numberOfCustomersWithReviews", 0] },
                        0,
                        {
                            $multiply: [
                                { $divide: ["$numberOfSatisfiedCustomers", "$numberOfCustomersWithReviews"] },
                                100
                            ]
                        }
                    ]
                }
            }
        }
    ]),

    // New Users Count
    newUsers: (startDate, endDate) => ([
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: null,
                totalNewUsers: { $sum: 1 }
            }
        }
    ]),

    // Top 3 Companies with Most Negative Reviews
    top3CompaniesWithMostNegativeReviews: (startDate, endDate) => ([
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $project: {
                company: "$vehicle.company",
                rating: 1,
                createdAt: 1
            }
        },
        {
            $group: {
                _id: "$company",
                totalNegativeReviews: { $sum: { $cond: [{ $lt: ["$rating", 3] }, 1, 0] } }
            }
        },
        {
            $sort: {
                totalNegativeReviews: -1
            }
        },
        {
            $limit: 3
        }
    ]),

    // Top Sellers with Most Negative Reviews
    topSellersWithMostNegativeReviews: (startDate, endDate) => ([
        {
            $match: {
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $project: {
                seller: "$owner.username",
                rating: 1,
                createdAt: 1
            }
        },
        {
            $group: {
                _id: "$seller",
                totalNegativeReviews: { $sum: { $cond: [{ $lt: ["$rating", 3] }, 1, 0] } }
            }
        },
        {
            $sort: {
                totalNegativeReviews: -1
            }
        },
        {
            $limit: 5
        }
    ]),

    // Car Category Wise Bookings
    carCategoryWiseBookings: (startDate, endDate) => ([
        {
            $match: {
                status : { $in: ["approved", "started", "ended", "reviewed"] },
                startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
        },
        {
            $group: {
                _id: "$vehicle.category",
                totalBookings: { $sum: 1 }
            }
        },
        {
            $sort: {
                totalBookings: -1
            }
        }
    ])
};