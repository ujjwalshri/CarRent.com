import Bidding from "../models/bidding.model.js";
import Vehicle from "../models/vehicle.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import City from "../models/city.model.js";
import CarCategory from "../models/car.category.model.js";
import { generateCongratulationMail,generateCongratulationMailToBuyer } from "../utils/gen.mail.js";

/*
@description: function to get suv and sedan cars numbers from the database createdAt between the given dates
takes startDate and endDate as query params
returns suv and sedan cars count
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

        return res.status(200).json({ suvVsSedan: result });
    } catch (err) {
        console.error(`Error in getSuvVsSedanCarsController: ${err.message}`);
        return res.status(500).json({ error: "An internal server error occurred." });
    }
};

/*
@description: function to get the top 10 popular car models from the database
takes startDate and endDate as query params
returns top 10 popular car models
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
                  createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
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
takes startDate and endDate as query params
returns top 3 most reviewed cars
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


        const result = await Review.aggregate(aggregationPipeline);
        return res.status(200).json({ result });

    } catch (err) {
        console.log(`error in the getTop3MostReviewedCarsController ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/*
function to get the top 3 owners with most cars added
takes startDate and endDate as query params
returns top 3 owners with most cars added
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
        return res.status(200).json({result});
    }catch(err){
        console.log(`error in the top3OwnersWithMostCarsAddedController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
/*
function to get the ongoingBookings
takes startDate and endDate as query params
returns onGoingBookings count
*/
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
return overall average booking duration
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
return bidding conversion rate
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
return the count of all the blocked Users on the platform
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
takes startDate and endDate as query params
returns the cout of biddings per city
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
        return res.status(200).json(result);
    } catch (err) {
        console.error(`Error in numberOfBookingsPerCityController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/*
@description: function to get the number of owners per city from the database
returns the count of owners per city
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
return the count of sellers and buyers
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
return the count of buyers per city
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
        const result = await User.aggregate(aggregationPipeline);
        return res.status(200).json(result);
    }catch(err){
        console.log(`error in the numberOfBuyersPerCityController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}
/*
@description: function to get the number of new users in the last 30 days
returns the count of new users in the last 30 days
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

export const getAllCarCategoriesController = async(req, res)=>{
    try{
        const carCategories = await CarCategory.find();
        return res.status(200).json(carCategories);
    }catch(err){
        console.log(`error in the getAllCarCategoriesController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }   
}
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

export const getUserGrowthController = async (req, res) => {
    try {
        let matchStage = {}; 


        if (req.query.startDate && req.query.endDate) {
            const start = new Date(req.query.startDate);
            const end = new Date(req.query.endDate);
            end.setHours(23, 59, 59, 999);

            matchStage = { createdAt: { $gte: start, $lte: end } };
        }


        const userGrowth = await User.aggregate([
            { $match: matchStage }, 
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        res.status(200).json(userGrowth);
    } catch (err) {
        console.error("Error fetching user growth:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserEngagementPercentageController = async (req, res) => { 
    try {
        const { startDate, endDate } = req.query;
        const totalNumberOfUsers = await User.countDocuments();
        console.log("Total Users:", totalNumberOfUsers);

        let matchStage = {};


        if (startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const aggregationPipeline = [
            { $match: matchStage }, 
            {
                $group: {
                    _id: "$from.username",
                    count: { $sum: 1 }
                }
            }
        ];

        const result = await User.aggregate(aggregationPipeline);
        const numberOfEngagedUsers = result.length;

        return res.status(200).json({
            engagementPercentage: totalNumberOfUsers !== 0 
                ? (numberOfEngagedUsers / totalNumberOfUsers) * 100 
                : 0
        });

    } catch (err) {
        console.error("Error fetching user engagement percentage:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const top10SellersWithMostEarningsController = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let matchStage = {
            status: { $in: ["ended", "reviewed"] }
        };


        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);

            if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
                return res.status(400).json({
                    error: "Invalid date format. Use a valid ISO date string."
                });
            }

            matchStage.updatedAt = { $gte: parsedStartDate, $lte: parsedEndDate };
        }

        const aggregationPipeline = [
            {
                $match: matchStage
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
                    fine: { $multiply: ["$excessKilometers", 10] },
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
                $sort: { totalEarnings: -1 }
            },
            {
                $limit: 10
            }
        ];

        const topSellers = await Bidding.aggregate(aggregationPipeline);

        return res.status(200).json({ topSellers });

    } catch (err) {
        console.error(`Error in top10SellersWithMostEarningsController: ${err}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendCongratulationMailController = async (req, res) => {
    const { email , amount, startDate, endDate, totalBookings} = req.body;
    if(totalBookings){
        try{
            generateCongratulationMailToBuyer(email,totalBookings,startDate? new Date(startDate).toLocaleDateString() : 'start of the platform', endDate? new Date(endDate).toLocaleDateString() : 'till now');
            return res.status(200).json({message: "Congratulation mail sent successfully"});
        }catch(err){
            console.log(`error in the sendCongratulationMailController ${err}`);
            return res.status(500).json({message: "Internal server error"});
        }
    }
    try{
         generateCongratulationMail(email, new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount),startDate? new Date(startDate).toLocaleDateString() : 'start of the platform', endDate? new Date(endDate).toLocaleDateString() : 'till now');
        return res.status(200).json({message: "Congratulation mail sent successfully"});
    }catch(err){
        console.log(`error in the sendCongratulationMailController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

export const topBuyersWithMostBookingsController = async (req, res) => {
    const {startDate, endDate} = req.query;
    try{
        let matchStage = {
            status: { $in: ["approved", "started", "ended", "reviewed"] }
        };


        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);

            if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
                return res.status(400).json({
                    error: "Invalid date format. Use a valid ISO date string."
                });
            }

            matchStage.updatedAt = { $gte: parsedStartDate, $lte: parsedEndDate };
        }
        const topBuyers = await Bidding.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: "$from._id",
                    buyerUsername: { $first: "$from.username" },
                    buyerEmail: { $first: "$from.email" },
                    buyerFirstName: { $first: "$from.firstName" },
                    buyerLastName: { $first: "$from.lastName" },
                    buyerCity: { $first: "$from.city" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);
        return res.status(200).json(topBuyers);
    }catch(err){
        console.log(`error in the topBuyersWithMostBookingsController ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}