import Bidding from "../models/bidding.model.js";
import Vehicle from "../models/vehicle.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Price from "../models/price.model.js";
import CarCategory from "../models/car.category.model.js";
import { sendTopSellerEmail, sendTopBuyerEmail } from "../services/email.service.js";
import { getCachedData, setCachedData } from "../services/redis.service.js";
import Charges from "../models/charges.model.js";

const kilometersLimit = 300; // Constant for kilometers limit
const finePerKilometer = 10; // Constant for fine per kilometer

const getValue = (result, fallback = 0) =>
    result.status === "fulfilled" ? result.value : fallback;


/**
 * Get car description statistics grouped by car category
 * @param {*} req 
 * @param {*} res 
 * @returns car description statistics
 */
export const getCarDescriptionStats = async (req, res) => {
    const { startDate, endDate } = req.query;
    // redis cache
    const cacheKey = `car-description-stats-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try {
        const carDescriptionPipeline = [
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
        ];

        const stats = await Vehicle.aggregate(carDescriptionPipeline);
        await setCachedData(cacheKey, stats);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get top 10 popular car models
 * @param {*} req 
 * @param {*} res 
 * @returns top 10 popular car models grouped by the whole car name
 */
export const getTop10PopularCarModels = async (req, res) => {
    const { startDate, endDate } = req.query;
    const cacheKey = `top-10-popular-car-models-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try {
        const top10PopularCarModelsPipeline = [
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
        ];
        const stats = await Bidding.aggregate(top10PopularCarModelsPipeline);
        await setCachedData(cacheKey, stats);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get top 3 most reviewed cars
 * @param {*} req 
 * @param {*} res 
 * @returns top 3 most reviewed cars grouped by the whole car name
 */
export const getTop3MostReviewedCars = async (req, res) => {
    const { startDate, endDate } = req.query;
    const cacheKey = `top-3-most-reviewed-cars-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try {

        const top3MostReviewedCarsPipeline = [
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
            },
        ];
        const stats = await Review.aggregate(top3MostReviewedCarsPipeline);
        await setCachedData(cacheKey, stats);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get top 3 owners with most popular cars 
 * @param {*} req 
 * @param {*} res 
 * @returns returns map of top 3 owners and the amount of bidding they have on their cars
 */
export const getTop3OwnersWithMostCars = async (req, res) => {
    const { startDate, endDate } = req.query;
    const cacheKey = `top-3-owners-with-most-cars-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try {
        const top3OwnersWithMostCarsAddedPipeline = [
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
        ]
        const stats = await Vehicle.aggregate(top3OwnersWithMostCarsAddedPipeline);
        await setCachedData(cacheKey, stats);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * function to get the number of biddings per city for the admin 
 * @param {*} req 
 * @param {*} res 
 * @returns returns map of city and bids
 */
export const getBiddingsPerCity = async (req, res) => {
    const { startDate, endDate } = req.query;
    const cacheKey = `biddings-per-city-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try {
        const numberOfBiddingPerCityPipeline = [
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
        ];
        const stats = await Bidding.aggregate(numberOfBiddingPerCityPipeline);
        await setCachedData(cacheKey, stats);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * function to get the user growth stats from the database shows how many new users joined the platform on which dates
 * @param {*} req 
 * @param {*} res 
 * @returns returns map of data and the number of new users created during that period
 */
export const getUserGrowthStats = async (req, res) => {
    const { startDate, endDate } = req.query;
    const cacheKey = `user-growth-stats-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try {

        const userGrowthPipeline = [
            { $match: {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }},
            {
             $group : {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
             }
            }, 
            { $sort: { _id: 1 } } 
        ]
        
        const stats = await User.aggregate(userGrowthPipeline);
        await setCachedData(cacheKey, stats);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * function to get the highest earning cities from the database
 * @param {*} req 
 * @param {*} res 
 * @returns returns map of city and the total earnings during the time period specified
 */
export const getHighestEarningCities = async (req, res) => {
    const { startDate, endDate } = req.query;
    const cacheKey = `highest-earning-cities-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try {
        const highestEarningCitiesPipeline =  [
            { $match:  {
                status: { $in: ["ended", "reviewed"] },
                endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            } },
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
        ];
        const stats = await Bidding.aggregate(highestEarningCitiesPipeline);
        await setCachedData(cacheKey, stats);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
@description: function to get the gneral analytics from the database
return overall general analytics for the admin
*/
export const getGeneralAnalyticsController = async (req, res) => {
  
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "startDate and endDate are required" });
      }

      const cacheKey = `admin-general-analytics-${startDate}-${endDate}`;
      const cachedData = await getCachedData(cacheKey);
      if(cachedData){
        console.log("serving data from cache");
        return res.status(200).json(cachedData);
      }
  
      const totalNumberOfBlockedUsersPromise = User.countDocuments({ isBlocked: true });
  
      const ongoingBookingsPromise = Bidding.aggregate([
        { $match: { status: "started" } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]);
  
      const averageBookingDurationPromise = Bidding.aggregate([
        {
          $match: {
            status: { $in: ["approved", "started", "ended", "reviewed"] },
            startDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
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
                    unit: "day",
                  },
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: "$durationInDays" },
          },
        },
      ]);
  
      const totalNumberOfUsersPromise = User.countDocuments();
  
      const userEngagementPromise = User.aggregate([ 
        {
          $group: {
            _id: "$from.username",
            count: { $sum: 1 },
          },
        },
      ]);
  
      const [
        blockedUsersResult,
        ongoingBookingsResult,
        avgDurationResult,
        totalUsersResult,
        userEngagementResult,
      ] = await Promise.allSettled([
        totalNumberOfBlockedUsersPromise,
        ongoingBookingsPromise,
        averageBookingDurationPromise,
        totalNumberOfUsersPromise,
        userEngagementPromise,
      ]);
  
      // Safe access helpers
      const totalNumberOfBlockedUsers = getValue(blockedUsersResult);
      const ongoingBookings = getValue(ongoingBookingsResult);
      const avgDurationData = getValue(avgDurationResult);
      const totalNumberOfUsers = getValue(totalUsersResult);
      const userEngagementData = getValue(userEngagementResult);
  
      const avgDuration =
        avgDurationData.length > 0 ? avgDurationData[0].avgDuration : 0;
  
      const numberOfEngagedUsers = userEngagementData.length;
      const engagementPercentage =
        totalNumberOfUsers !== 0
          ? (numberOfEngagedUsers / totalNumberOfUsers) * 100
          : 0;

      await setCachedData(cacheKey, {
        avgDuration,
        engagementPercentage,
        totalNumberOfUsers,
        numberOfEngagedUsers,
        totalNumberOfBlockedUsers,
        ongoingBookings: ongoingBookings.length ? ongoingBookings[0].count : 0,
      });
      // serving data from cache
      console.log("serving data from database");
  
      return res.status(200).json({
        avgDuration,
        engagementPercentage,
        totalNumberOfUsers,
        numberOfEngagedUsers,
        totalNumberOfBlockedUsers,
        ongoingBookings: ongoingBookings.length ? ongoingBookings[0].count : 0,
      });
    } catch (err) {
      console.error(`Error in getGeneralAnalyticsController: ${err}`);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
/*
@description: function to get the overview stats from the database for the super admin
return all the overview stats
*/
export const getOverviewStatsController = async (req, res) => {
    const {startDate, endDate} = req.query;
    if(!startDate || !endDate){
        return res.status(400).json({message: "startDate and endDate are required"});
    }
    // check if the data is already in the cache
    const cacheKey = `admin-overview-stats-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        console.log("serving data from cache");
        return res.status(200).json(cachedData);
    }
    try {
        let matchStage =   {
            $match: {
                startDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }
        };
        const biddingConversionRatePipeline = [
          matchStage,
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

        const newUsersPipeline = [
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

       

        const [biddingConversionRateResult, newUsersResult] = await Promise.allSettled([
            Bidding.aggregate(biddingConversionRatePipeline),
            User.aggregate(newUsersPipeline),
        ]);

        const biddingConversionRate = getValue(biddingConversionRateResult);
        const newUsers = getValue(newUsersResult);

        await setCachedData(cacheKey, {
            biddingConversionRate,
            newUsers
        });
        // serving data from cache
        console.log("serving data from database");
        return res.status(200).json({ biddingConversionRate, newUsers });
    } catch (err) {
        console.error(`Error in getBiddingConversionRateController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};


/**
 * Retrieves top 10 sellers with highest earnings
 * Calculates total earnings including base amounts and fines
 * Can be filtered by date range through query parameters
 * 
 * @param {Object} req - Express request object with optional startDate and endDate query params
 * @param {Object} res - Express response object
 * @returns {Object} - Object containing array of top sellers with earnings details
 */
export const topPerformersController = async (req, res) => {
    const { startDate, endDate } = req.query;
    if(!startDate || !endDate){
        return res.status(400).json({message: "startDate and endDate are required"});
    }

    const cacheKey = `admin-top-performers-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        console.log("serving data from cache");
        return res.status(200).json(cachedData);
    }

    try {
        // Initialize match stage with completed booking statuses
        let sellersMatchStage = {
            status: { $in: ["ended", "reviewed"] }
        };

        // Apply date filter if startDate and endDate are provided
        sellersMatchStage.endDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        
        // Complex aggregation pipeline to calculate earnings
        const topSellersPipeline = [
            {
                $match: sellersMatchStage // Filter bookings by status and date range
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
                    // Calculate excess kilometers (above 300km limit)
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
                    // Calculate fine for excess kilometers ($10 per km)
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
        ];

        let buyersMatchStage = {
            status: { $in: ["approved", "started", "ended", "reviewed"] }
        };

        // Apply date filter if startDate and endDate are provided
            buyersMatchStage.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };

        
        // Aggregation pipeline to find and rank top buyers
        const topBuyersPipeline = [
            { $match: buyersMatchStage }, // Filter bookings by status and date range
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
        ];

        const [topSellersResult, topBuyersResult] = await Promise.allSettled([
            Bidding.aggregate(topSellersPipeline),
            Bidding.aggregate(topBuyersPipeline)
        ]);

        const topSellers = getValue(topSellersResult, []);
        const topBuyers = getValue(topBuyersResult, []);

        await setCachedData(cacheKey, {
            topSellers,
            topBuyers
        });
        // serving data from cache
        console.log("serving data from database");

        return res.status(200).json({ topSellers, topBuyers });

    } catch (err) {
        console.error(`Error in top10SellersWithMostEarningsController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};





/**
 * Retrieves customer satisfaction score for a given date range
 * 
 * @param {Object} req - Express request object with optional startDate and endDate query params
 * @param {Object} res - Express response object
 * @returns {Object} - Object containing customer satisfaction score
 */
export const getCustomerSatisfactionScoreController = async (req, res)=>{
    try{
        const {startDate, endDate} = req.query;
        if(!startDate || !endDate){
            return res.status(400).json({message: "startDate and endDate are required"});
        }

        const cacheKey = `admin-customer-satisfaction-score-${startDate}-${endDate}`;
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            console.log("serving data from cache");
            return res.status(200).json(cachedData);
        }
      // pipeline for calculating the customer satisfaction score which is calculated numberOfSatisfiedCustomers/numberOfCustomersWithReviews * 100
      const customerSatisfactionPipeline = [
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
      ];
      

      const customerSatisfactionScore = await Review.aggregate(customerSatisfactionPipeline);
      await setCachedData(cacheKey, {customerSatisfactionScore});
      return res.status(200).json(customerSatisfactionScore);
      
    }catch(err){
        console.log(`error in the getCustomerSatisfactionScoreController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}



/**
 * funcition to get the number of new users in a given date range
 * @description: function to get the number of new users in a given date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Object containing the number of new users
 */
export const getNewUsers = async(req, res)=>{
    try{
        const {startDate, endDate} = req.query;
        if(!startDate || !endDate){
            return res.status(400).json({message: "startDate and endDate are required"});
        }
        const cacheKey = `new-users-${startDate}-${endDate}`;
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }

        const newUsers = await User.aggregate([
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
        ]);
        await setCachedData(cacheKey, newUsers);
        return res.status(200).json(newUsers);
    }catch(err){
        console.log(`error in the getNewUsersController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
/**
 * Retrieves the top 3 companies with the most negative reviews for a given date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Object containing the top 3 companies with the most negative reviews
 */
export const getTop3CompaniesWithMostNegativeReviews = async(req, res)=>{
    try{
        const {startDate, endDate} = req.query;
        if(!startDate || !endDate){
            return res.status(400).json({message: "startDate and endDate are required"});
        }
        const cacheKey = `top-3-companies-with-most-negative-reviews-${startDate}-${endDate}`;
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const companies = await Review.aggregate([
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
        ]);
        await setCachedData(cacheKey, companies);
        return res.status(200).json(companies);
    }catch(err){
        console.log(`error in the getTop3CompaniesWithMostNegativeReviewsController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}


/**
 * Fucntion to get the top sellers with most negative reviews
 * @description: function to get the top sellers with most negative reviews
 * @param {*} req 
 * @param {*} res 
 * returns {Object} - Object containing the top sellers with most negative reviews
 */
export const topSellersWithMostNegativeReviews = async(req, res)=>{
    try{
        const {startDate, endDate} = req.query;
        if(!startDate || !endDate){
            return res.status(400).json({message: "startDate and endDate are required"});
        }
        const cacheKey = `top-sellers-with-most-negative-reviews-${startDate}-${endDate}`;
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const sellers = await Review.aggregate([
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
        ]);
        await setCachedData(cacheKey, sellers);
        return res.status(200).json(sellers);
    }catch(err){
        console.log(`error in the topSellersWithMostNegativeReviewsController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }

}


/**
 * function to get the car category wise bookings from the database 
 * @param {*} req 
 * @param {*} res 
 * @returns response with the car category wise bookings
 */
export const getCarCateogoryWiseBookings = async(req, res)=>{
    const {startDate, endDate} = req.query;
    if(!startDate || !endDate){
        return res.status(400).json({message: "startDate and endDate are required"});
    }
    const cacheKey = `car-category-wise-bookings-${startDate}-${endDate}`;
    const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
    try{
        const bookings = await Bidding.aggregate([
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
        ]);
        await setCachedData(cacheKey, bookings);
        return res.status(200).json(bookings);
    }catch(err){
        console.log(`error in the getCarCateogoryWiseBookingsController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}


/*** 
 * Admin controller for managing car categories,sending congratulatory emails and updating price ranges
 */

/**
 * Retrieves all car categories from the database
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} - Array of car categories
 */
export const getAllCarCategoriesController = async(req, res)=>{
    try{
        const carCategories = await CarCategory.find();
        return res.status(200).json(carCategories);
    }catch(err){
        console.log(`error in the getAllCarCategoriesController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }   
}

/*
@description: function to add a car cateogory by the admin
takes name as the request body
return car category
*/
export const addCarCategoryController = async(req, res)=>{
    const {name} = req.body;
    try{
        const carCategory = await CarCategory.create({name});
        return res.status(200).json(carCategory);
    }catch(err){
        console.log(`error in the addCarCategoryController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}


/**
 * Deletes a car category from the database by its ID
 * 
 * @param {Object} req - Express request object containing categoryID in params
 * @param {Object} res - Express response object
 * @returns {Object} - Returns deleted car category information or error message
 */
export const deleteCarCategoryController = async(req, res)=>{
    const {categoryID} = req.params;
    try{
        const carCategory = await CarCategory.findByIdAndDelete(categoryID);
        return res.status(200).json(carCategory);
    }catch(err){
        console.log(`error in the deleteCarCategoryController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}




/**
 * Sends congratulation emails to top-performing users (sellers and buyers)
 * Handles different email templates based on user type
 * 
 * @param {Object} req - Express request object containing email recipient details
 * @param {Object} res - Express response object
 * @returns {Object} - Success or error message
 */
export const sendCongratulationMailController = async (req, res) => {
    const { email, amount, startDate, endDate, totalBookings} = req.body;
    
    // Handle buyer congratulation emails (identified by totalBookings field)
    if(totalBookings){
        try{
            // Format dates for email display
            const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : 'start of the platform';
            const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : 'till now';
            
            // Send congratulation email to buyer
            sendTopBuyerEmail(
               { email: email,
                totalBookings: totalBookings,
               startDate: formattedStartDate, 
               endDate: formattedEndDate}
            ).catch((err) => {
                console.error(`Error sending congratulation email to buyer: ${err.message}`);
            });
            
            return res.status(200).json({message: "Congratulation mail sent successfully"});
        }catch(err){
            console.log(`error in the sendCongratulationMailController ${err}`);
            return res.status(500).json({message: "Internal server error"});
        }
    }
    
    // Handle seller congratulation emails
    try{
        // Format amount as currency and dates for email display
        const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : 'start of the platform';
        const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : 'till now';
        
        // Send congratulation email to seller
        sendTopSellerEmail(
           { email: email, 
            amount:formattedAmount,
           startDate: formattedStartDate, 
           endDate: formattedEndDate}
        ).catch((err) => {
            console.error(`Error sending congratulation email to seller: ${err.message}`);
        });
        
        return res.status(200).json({message: "Congratulation mail sent successfully"});
    }catch(err){
        console.log(`error in the sendCongratulationMailController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}



/**
 * Adds a new price range to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Object containing the price range
 */
export const updatePriceRangeController = async (req, res)=>{
    try{
        const {min, max} = req.body;
        if(!min || !max){
            return res.status(400).json({message: "min and max are required"});
        }
        if(min >= max){
            return res.status(400).json({message: "min must be less than max"});
        }
        const priceRange = await Price.updateOne({_id: "68063765d698682cae2ad369"}, {min, max});
        return res.status(200).json(priceRange);
    }catch(err){
        console.log(`error in the addPriceRangeController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
/**
 * Retrieves current price ranges from the database 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} - Array of price ranges
 */
export const getCurrentPriceRangesController = async (req, res)=>{
    try{
        const priceRanges = await Price.find();
        return res.status(200).json(priceRanges);
    }catch(err){
        console.log(`error in the getCurrentPriceRangesController ${err}`);
        return res.status(500).json({message: "Internal server error"});    
    }
}

/**
 * Retrieves all charges from the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} - Array of charges
 */
export const getChargesController = async (req, res)=>{
    try{
        const charges = await Charges.find();
        return res.status(200).json(charges);
    }catch(err){
        console.log(`error in the getChargesController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}


/**
 * Updates the charges in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Object containing the updated charges
 */
export const updateChargesController = async (req, res)=>{
    try{
        const {charge, percentage} = req.body;
        if(charge=== undefined || percentage=== undefined){
            return res.status(400).json({message: "charge and percentage are required"});
        }
         await Charges.updateOne({name: charge}, { $set: {percentage: percentage}});
        return res.status(200).json({message: "Charges updated successfully"});
    }catch(err){
        console.log(`error in the updateChargesController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
