import Bidding from "../models/bidding.model.js";
import Vehicle from "../models/vehicle.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Price from "../models/price.model.js";
import CarCategory from "../models/car.category.model.js";
import { generateCongratulationMail,generateCongratulationMailToBuyer } from "../utils/gen.mail.js";
// importing redis service
import { getCachedData, setCachedData } from "../services/redis.service.js";
import Charges from "../models/charges.model.js";

const kilometersLimit = 300; // Constant for kilometers limit
const finePerKilometer = 10; // Constant for fine per kilometer

const getValue = (result, fallback = 0) =>
    result.status === "fulfilled" ? result.value : fallback;
/*
@description: function to get charts data by running all the pipelines in parallel using Promise.allSettled 
@params startDate and endDate
returns the charts data
*/
export const getChartsDataController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; //2025-03-25T00:00:00.000Z example date format

       if(!startDate || !endDate){
        return res.status(400).json({message: "startDate and endDate are required"});
       }

       const cacheKey = `admin-charts-data-${startDate}-${endDate}`;
       const cachedData = await getCachedData(cacheKey);
       if(cachedData){
        console.log("serving data from cache");
        return res.status(200).json(cachedData);
       }

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



         const top3MostReviewedCarsPipeline = [
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


        // running all the pipelines in parallel using the Promise.allSettled
        const [ carDescriptionResult, top10PopularCarModelsResult, top3MostReviewedCarsResult, top3OwnersWithMostCarsAddedResult, numberOfBiddingsPerCityResult, userGrowthResult, highestEarningCitiesResult] = await Promise.allSettled([
            Vehicle.aggregate(carDescriptionPipeline),
            Bidding.aggregate(top10PopularCarModelsPipeline),
            Review.aggregate(top3MostReviewedCarsPipeline),
            Vehicle.aggregate(top3OwnersWithMostCarsAddedPipeline),
            Bidding.aggregate(numberOfBiddingPerCityPipeline),
            User.aggregate(userGrowthPipeline),
            Bidding.aggregate(highestEarningCitiesPipeline)
        ]);

        // Safe access helpers
        const carDescription = getValue(carDescriptionResult, []);
        const top10PopularCarModels = getValue(top10PopularCarModelsResult, []);
        const top3MostReviewedCars = getValue(top3MostReviewedCarsResult, []);
        const top3OwnersWithMostCarsAdded = getValue(top3OwnersWithMostCarsAddedResult, []);
        const numberOfBiddingsPerCity = getValue(numberOfBiddingsPerCityResult, []);
        const userGrowth = getValue(userGrowthResult, []);
        const highestEarningCities = getValue(highestEarningCitiesResult, []);
       
        // save the data to the cache 
        await setCachedData(cacheKey, {
            carDescription,
            top10PopularCarModels,
            top3MostReviewedCars,
            top3OwnersWithMostCarsAdded,
            numberOfBiddingsPerCity,
            userGrowth,
            highestEarningCities
        });


        return res.status(200).json({ carDescription, top10PopularCarModels, top3MostReviewedCars, top3OwnersWithMostCarsAdded, numberOfBiddingsPerCity, userGrowth, highestEarningCities });
        
    } catch (err) {
        console.error(`Error in getSuvVsSedanCarsController: ${err.message}`);
        return res.status(500).json({ error: "An internal server error occurred." });
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



/*
@description: function to get the number of owners per city from the database
returns the count of owners per city
*/
export const usersPerCityController = async (req, res) => {
    try {
        const cacheKey = `admin-users-per-city`;
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            console.log("serving data from cache");
            return res.status(200).json(cachedData);
        }
        const aggregationPipelineForSellers = [
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
        const aggregationPipelineForBuyers = [
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
        ]
        const [sellersResult, buyersResult] = await Promise.allSettled([    
            User.aggregate(aggregationPipelineForSellers),
            User.aggregate(aggregationPipelineForBuyers)
        ]);
        const sellers = getValue(sellersResult,[]);
        const buyers = getValue(buyersResult,[]);

        await setCachedData(cacheKey, {
            sellers,
            buyers
        });
        // serving data from cache
        console.log("serving data from database");
        return res.status(200).json({ sellers, buyers });
    } catch (err) {
        console.error(`Error in numberOfOwnersPerCityController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
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
            generateCongratulationMailToBuyer(
                email,
                totalBookings,
                formattedStartDate, 
                formattedEndDate
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
        generateCongratulationMail(
            email, 
            formattedAmount,
            formattedStartDate, 
            formattedEndDate
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
        console.log(charge, percentage);
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


/**
 * Retrieves the platform revenue for a given date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Object containing the platform revenue
 */ 
export const getPlatformRevenueForAdminController = async (req, res)=>{
    try{
        const {startDate, endDate} = req.query;
        if(!startDate || !endDate){
            return res.status(400).json({message: "startDate and endDate are required"});
        }

        const platformRevenue = await Bidding.aggregate([
            {
                $match: {
                    status: { $in: ["ended", "reviewed"] },
                    endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
                }
            },
            {
                $addFields: {
                    // Calculate number of days (including both start and end dates)
                    numberOfDays: {
                        $add: [
                            {
                                $divide: [
                                    { $subtract: ["$endDate", "$startDate"] },
                                    1000 * 60 * 60 * 24
                                ]
                            },
                            1
                        ]
                    },
                    // Calculate total addons price
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
                    // Calculate base price (days * amount)
                    basePrice: { $multiply: ["$numberOfDays", "$amount"] },
                    // Calculate total booking price (base price + addons + distance fine)
                    totalBookingPrice: {
                        $add: [
                            { $multiply: ["$numberOfDays", "$amount"] },
                            "$addonsTotal",
                            { $ifNull: ["$exceededKmCharge", 0] }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    // Calculate platform fee if platformFeePercentage exists
                    platformFee: {
                        $cond: {
                            if: { $gt: [{ $ifNull: ["$platformFeePercentage", 0] }, 0] },
                            then: {
                                $multiply: [
                                    "$totalBookingPrice",
                                    { $divide: [{ $ifNull: ["$platformFeePercentage", 0] }, 100] }
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPlatformRevenue: { $sum: "$platformFee" },
                    totalBookings: { $sum: 1 },
                    totalBaseRevenue: { $sum: "$basePrice" },
                    totalAddonsRevenue: { $sum: "$addonsTotal" },
                    totalDistanceFines: { $sum: { $ifNull: ["$exceededKmCharge", 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalPlatformRevenue: { $round: ["$totalPlatformRevenue", 2] },
                    totalBookings: 1,
                    totalBaseRevenue: { $round: ["$totalBaseRevenue", 2] },
                    totalAddonsRevenue: { $round: ["$totalAddonsRevenue", 2] },
                    totalDistanceFines: { $round: ["$totalDistanceFines", 2] },
                    totalGrossRevenue: {
                        $round: [{
                            $add: ["$totalBaseRevenue", "$totalAddonsRevenue", "$totalDistanceFines"]
                        }, 2]
                    }
                }
            }
        ]);
        return res.status(200).json(platformRevenue);
        
    }catch(err){
        console.log(`error in the getPlatformRevenueForAdminController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

