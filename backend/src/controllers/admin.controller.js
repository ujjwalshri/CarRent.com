import Bidding from "../models/bidding.model.js";
import Vehicle from "../models/vehicle.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";
import Price from "../models/price.model.js";
import CarCategory from "../models/car.category.model.js";
import { sendTopSellerEmail, sendTopBuyerEmail } from "../services/email.service.js";
import { getCachedData, setCachedData } from "../services/redis.service.js";
import Charges from "../models/charges.model.js";
import { pipelines } from "../utils/analyticsPipelines/adminAnalytics.pipelines.js";



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
   
    try {
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const stats = await Vehicle.aggregate(pipelines.carDescription(startDate, endDate));
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
   
    try {
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const stats = await Bidding.aggregate(pipelines.top10PopularCarModels(startDate, endDate));
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
    
    try {
        const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
        const stats = await Review.aggregate(pipelines.top3MostReviewedCars(startDate, endDate));
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
   
    try {
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const stats = await Vehicle.aggregate(pipelines.top3OwnersWithMostCars(startDate, endDate));
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

    try {
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const stats = await Bidding.aggregate(pipelines.biddingsPerCity(startDate, endDate));
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
    
    try {
        const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        return res.status(200).json(cachedData);
    }
        const stats = await User.aggregate(pipelines.userGrowth(startDate, endDate));
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
   
    try {
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const stats = await Bidding.aggregate(pipelines.highestEarningCities(startDate, endDate));
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
  
      const ongoingBookingsPromise = Bidding.aggregate(pipelines.generalAnalytics(startDate, endDate).ongoingBookings);
  
      const averageBookingDurationPromise = Bidding.aggregate(pipelines.generalAnalytics(startDate, endDate).averageBookingDuration);
  
      const totalNumberOfUsersPromise = User.countDocuments();
  
      const userEngagementPromise = Bidding.aggregate(pipelines.generalAnalytics(startDate, endDate).userEngagement);
  
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
   
    try {
        const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        console.log("serving data from cache");
        return res.status(200).json(cachedData);
    }
        const biddingConversionRatePipeline = pipelines.overviewStats(startDate, endDate).biddingConversionRate; // getting the pipelines from the analytics pipelines folder

        const newUsersPipeline = pipelines.overviewStats(startDate, endDate).newUsers; // getting the pipelines from the analytics pipelines folder

       
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
    

    try {
        const cachedData = await getCachedData(cacheKey);
    if(cachedData){
        console.log("serving data from cache");
        return res.status(200).json(cachedData);
    }
       
        const topPerformersPipelines =  pipelines.topPerformers(startDate, endDate);

        const [topSellersResult, topBuyersResult] = await Promise.allSettled([
            Bidding.aggregate(topPerformersPipelines.topSellers),
            Bidding.aggregate(topPerformersPipelines.topBuyers)
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

   
      

      const customerSatisfactionScore = await Review.aggregate(pipelines.customerSatisfaction(startDate, endDate));
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

        const newUsers = await User.aggregate(pipelines.newUsers(startDate, endDate));
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
        const companies = await Review.aggregate(pipelines.top3CompaniesWithMostNegativeReviews(startDate, endDate));
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
        const sellers = await Review.aggregate(pipelines.topSellersWithMostNegativeReviews(startDate, endDate));
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
   
    try{
        const cachedData = await getCachedData(cacheKey);
        if(cachedData){
            return res.status(200).json(cachedData);
        }
        const bookings = await Bidding.aggregate(pipelines.carCategoryWiseBookings(startDate, endDate));
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
