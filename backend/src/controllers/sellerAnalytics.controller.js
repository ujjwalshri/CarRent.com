/**
 * Seller Analytics Controller
 * This controller handles all analytics-related operations for sellers including revenue calculations,
 * booking statistics, and performance metrics.
 */

import Vehicle from "../models/vehicle.model.js";
import Bidding from "../models/bidding.model.js";
import Review from "../models/review.model.js";
import { getCachedData, setCachedData } from "../services/redis.service.js";
import { pipelines } from "../utils/analyticsPipelines/sellerAnalytics.pipelines.js";


/**
 * Helper function to handle controller response
 * @param {Object} res - Express response object or custom handler
 * @param {number} status - HTTP status code
 * @param {Object} data - Response data
 */ 
const handleResponse = (res, status, data) => {
        return res.status(status).json(data);
};


/**
 * @description Get the total revenue for a seller within a date range
 * @param {*} req - The request object
 * @param {*} res - The response object
 * @returns {Object} The total revenue data
 */
export const getTotalRevenue = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-revenue-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const revenueData = await Bidding.aggregate(pipelines.totalRevenue(userId, startDate, endDate));
        const result = revenueData[0] || { 
            totalRevenue: 0, 
            totalFineCollected: 0, 
            totalBookings: 0,
            averageRevenue: 0
        };
        await setCachedData(cacheKey, result);
        return handleResponse(res, 200, result);
    } catch (error) {
        console.error('Error in getTotalRevenue:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch revenue data' });
    }
};


/**
 * @description Get the car description for a seller within a date range
 * @param {Object} req - The request object
 * @param {Object} req.user - The authenticated user
 * @param {string} req.user._id - The user id
 * @param {Object} req.query - The query parameters
 * @param {string} req.query.startDate - The start date
 * @param {string} req.query.endDate - The end date
 * @param {Object} res - The response object
 * @returns {Object} The car description data
 */
export const getCarDescription = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-car-description-${userId}-${startDate}-${endDate}`;
    

    try {
        const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }
        const carDescriptionData = await Vehicle.aggregate(pipelines.carDescription(userId, startDate, endDate));
        await setCachedData(cacheKey, carDescriptionData);
        return handleResponse(res, 200, carDescriptionData);
    } catch (error) {
        console.error('Error in getCarDescription:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch car description data' });
    }
};


/**
 * @description Get the popular cars for a seller within a date range
 * @param {*} req returns the request object
 * @param {*} res returns the response object
 * @returns {Object} The popular cars data
 */
export const getPopularCars = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-popular-cars-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const popularCarsData = await Bidding.aggregate(pipelines.popularCars(userId, startDate, endDate));
        await setCachedData(cacheKey, popularCarsData);
        return handleResponse(res, 200, popularCarsData);
    } catch (error) {
        console.error('Error in getPopularCars:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch popular cars data' });
    }
};

/**
 * function to get the car wise bookings for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the car wise bookings for a seller
 */
export const getCarWiseBookings = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-car-wise-bookings-${userId}-${startDate}-${endDate}`;
    

    try {
        const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }
        const carWiseBookingsData = await Bidding.aggregate(pipelines.carWiseBookings(userId, startDate, endDate));
        await setCachedData(cacheKey, carWiseBookingsData);
        return handleResponse(res, 200, carWiseBookingsData);
    } catch (error) {
        console.error('Error in getCarWiseBookings:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch car-wise bookings data' });
    }
};


/**
 * function to get the negative reviews for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the negative reviews for a seller
 */
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
        await setCachedData(cacheKey, negativeReviewsData);
        return handleResponse(res, 200, negativeReviewsData);
    } catch (error) {
        console.error('Error in getNegativeReviews:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch negative reviews data' });
    }
};


/**
 * function to get the top earning cars for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the top earning cars for a seller
 */
export const getTopEarningCars = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-top-earning-cars-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const topEarningCarsData = await Bidding.aggregate(pipelines.topEarningCars(userId, startDate, endDate));
        await setCachedData(cacheKey, topEarningCarsData);
        return handleResponse(res, 200, topEarningCarsData);
    } catch (error) {
        console.error('Error in getTopEarningCars:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch top earning cars data' });
    }
};

/**
 * function to get the peak bidding hours for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the peak bidding hours for a seller
 */
export const getPeakHours = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-peak-hours-${userId}-${startDate}-${endDate}`;
    

    try {
        const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }
        const peakHoursData = await Bidding.aggregate(pipelines.peakHours(userId, startDate, endDate));
        const result = {
            data: Array.from({ length: 24 }, (_, i) => {
                const existingHour = peakHoursData.find(r => r.hour === i);
                return existingHour || { hour: i, count: 0 };
            }),
            timeZone: "Asia/Kolkata"
        };
        await setCachedData(cacheKey, result);
        return handleResponse(res, 200, result);
    } catch (error) {
        console.error('Error in getPeakHours:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch peak hours data' });
    }
};


/**
 * function to get the monthly bookings for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the monthly bookings for a seller
 */
export const getMonthlyBookings = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-monthly-bookings-${userId}-${startDate}-${endDate}`;
    

    try {
        const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }
        const monthlyBookingsData = await Bidding.aggregate(pipelines.monthlyBookings(userId, startDate, endDate));
        await setCachedData(cacheKey, monthlyBookingsData);
        return handleResponse(res, 200, monthlyBookingsData);
    } catch (error) {
        console.error('Error in getMonthlyBookings:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch monthly bookings data' });
    }
};


/**
 * function to get the top customers for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the top customers for a seller
 */
export const getTopCustomers = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-top-customers-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const topCustomersData = await Bidding.aggregate(pipelines.topCustomers(userId, startDate, endDate));
        await setCachedData(cacheKey, topCustomersData);
        return handleResponse(res, 200, topCustomersData);
    } catch (error) {
        console.error('Error in getTopCustomers:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch top customers data' });
    }
};

/**
 * function to get the average rental duration for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the average rental duration for a seller
 */
export const getAverageRentalDuration = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-avg-rental-duration-${userId}-${startDate}-${endDate}`;
    
    try {
        const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }

        const avgRentalDurationData = await Bidding.aggregate(pipelines.averageRentalDuration(userId, startDate, endDate));
        await setCachedData(cacheKey, avgRentalDurationData);
        return handleResponse(res, 200, avgRentalDurationData);
    } catch (error) {
        console.error('Error in getAverageRentalDuration:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch average rental duration data' });
    }
};


/**
 * function to get the repeating customers percentage for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the repeating customers percentage for a seller
 */
export const getRepeatingCustomersPercentage = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-repeating-customers-${userId}-${startDate}-${endDate}`;
  

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const repeatingCustomersData = await Bidding.aggregate(pipelines.repeatingCustomersPercentage(userId, startDate, endDate));
        await setCachedData(cacheKey, repeatingCustomersData);
        return handleResponse(res, 200, repeatingCustomersData);
    } catch (error) {
        console.error('Error in getRepeatingCustomersPercentage:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch repeating customers percentage data' });
    }
};


/**
 * function to get the city wise bookings for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the city wise bookings for a seller
 */
export const getCityWiseBookings = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-city-wise-bookings-${userId}-${startDate}-${endDate}`;
  

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const cityWiseBookingsData = await Bidding.aggregate(pipelines.cityWiseBookings(userId, startDate, endDate));
        await setCachedData(cacheKey, cityWiseBookingsData);
        return handleResponse(res, 200, cityWiseBookingsData);
    } catch (error) {
        console.error('Error in getCityWiseBookings:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch city-wise bookings data' });
    }
};

/**
 * function to get the bidding comparison for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the bidding comparison for a seller
 */
export const getBiddingComparison = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-bidding-comparison-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const [myBidsData] = await Bidding.aggregate(pipelines.sellerBids(userId, startDate, endDate));
        const [otherSellersData] = await Bidding.aggregate(pipelines.otherSellersAvgBids(userId, startDate, endDate));

        const result = {
            myBids: myBidsData?.totalBids || 0,
            otherSellersAvgBids: otherSellersData?.avgBids || 0
        };

        await setCachedData(cacheKey, result);
        return handleResponse(res, 200, result);
    } catch (error) {
        console.error('Error in getBiddingComparison:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch bidding comparison data' });
    }
};


/**
 * function to get the earning comparison for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the earning comparison for a seller
 */
export const getEarningComparison = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-earning-comparison-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const [comparisonData] = await Bidding.aggregate(pipelines.myEarningVsOtherSellersAvgEarnings(userId, startDate, endDate));
        
        const result = {
            myEarnings: comparisonData?.myEarnings || 0,
            otherSellersAvgEarnings: comparisonData?.otherSellersAvgEarnings || 0
        };

        await setCachedData(cacheKey, result);
        return handleResponse(res, 200, result);
    } catch (error) {
        console.error('Error in getEarningComparison:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch earning comparison data' });
    }
};

/**
 * function to get the total revenue by addons for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the total revenue by addons for a seller
 */
export const getTotalRevenueByAddons = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-total-revenue-by-addons-${userId}-${startDate}-${endDate}`; 
  

    try {
        const cachedData = await getCachedData(cacheKey); 
        if (cachedData) {
            return handleResponse(res, 200, cachedData); 
        }
        const totalRevenueByAddonsData = await Bidding.aggregate(pipelines.totalRevenueByAddons(userId, startDate, endDate));
        await setCachedData(cacheKey, totalRevenueByAddonsData);
        return handleResponse(res, 200, totalRevenueByAddonsData);
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
    

    try {
        const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
        return handleResponse(res, 200, cachedData);
    }
        const averageCostPerRentalData = await Bidding.aggregate(pipelines.averageBidCostPerRental(userId, startDate, endDate));
        await setCachedData(cacheKey,    averageCostPerRentalData );
        return handleResponse(res, 200,   averageCostPerRentalData  );
    } catch (error) {
        console.error('Error in getAverageCostPerRental:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch average cost per rental data' });
    }
};

/**
 * function to get the average booking payment for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the average booking payment for a seller
 */
export const getAverageBookingPayment = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-average-booking-payment-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const averageBookingPaymentData = await Bidding.aggregate(pipelines.averageBookingPayment(userId, startDate, endDate));
        await setCachedData(cacheKey, averageBookingPaymentData);
        return handleResponse(res, 200, averageBookingPaymentData);
    } catch (error) {
        console.error('Error in getAverageBookingPayment:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch average booking payment data' });
    }
};

/**
 * function to get the selected addons count for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns the selected addons count for a seller
 */
export const getSelectedAddonsCount = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }
    const cacheKey = `seller-selected-addons-count-${userId}-${startDate}-${endDate}`;

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const selectedAddonsCountData = await Bidding.aggregate(pipelines.selectedAddonsCount(userId, startDate, endDate));
        return handleResponse(res, 200, selectedAddonsCountData);
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
    const cacheKey = `top-cities-with-most-negative-reviews-${sellerId}-${startDate}-${endDate}`;
  
    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const topCitiesWithMostNegativeReviewsData = await Review.aggregate(pipelines.topCitiesWithMostNegativeReviews(sellerId, startDate, endDate));
        return handleResponse(res, 200, topCitiesWithMostNegativeReviewsData );
    } catch (error) {
        console.error('Error in getTopCitiesWithMostNegativeReviews:', error);
        return handleResponse(res, 500, {error: 'Failed to fetch top cities with most negative reviews data'});
    }
}


/**
 * function to get the city wise earnings for a seller
 * @param {*} req 
 * @param {*} res 
 * @returns returns map of city wise earnings for a seller
 */
export const cityWiseEarnings = async (req, res) => {
    const {startDate, endDate} = req.query;
    const userId = req.user._id;
    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }
    const cacheKey = `seller-city-wise-earnings-${userId}-${startDate}-${endDate}`;
   
    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const cityWiseEarningsData = await Bidding.aggregate(pipelines.cityWiseEarnings(userId, startDate, endDate));
        await setCachedData(cacheKey, cityWiseEarningsData);
        return handleResponse(res, 200, cityWiseEarningsData);
    } catch (error) {
        console.error('Error in getCityWiseEarnings:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch city-wise earnings data' });
    }
}

/**
 * Get analytics for bookings grouped by price ranges
 * @param {Object} req - The request object
 * @param {Object} req.user - The authenticated user
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.startDate - Start date for the analysis
 * @param {string} req.query.endDate - End date for the analysis
 */
export const getPriceRangeAnalytics = async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-price-range-analytics-${userId}-${startDate}-${endDate}`;
   

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const priceRangeData = await Bidding.aggregate(pipelines.priceRangeBookings(userId, startDate, endDate));
        await setCachedData(cacheKey, priceRangeData);
        return handleResponse(res, 200, priceRangeData);
    } catch (error) {
        console.error('Error in getPriceRangeAnalytics:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch price range analytics data' });
    }
};


/**
 * function to get the average rating for a seller based on price ranges of his cars
 * @param {*} req 
 * @param {*} res 
 * @returns returns the average rating for a seller based on price ranges of his cars
 */
export const priceRangeWiseAverageRating = async (req, res) => {
    console.log("priceRangeWiseAverageRating");
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return handleResponse(res, 400, { error: "startDate and endDate are required" });
    }

    const cacheKey = `seller-price-range-wise-average-rating-${userId}-${startDate}-${endDate}`;

    try {
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return handleResponse(res, 200, cachedData);
        }
        const priceRangeWiseAverageRatingData = await Review.aggregate(pipelines.priceRangeWiseAverageRating(userId, startDate, endDate));
        console.log(priceRangeWiseAverageRatingData);
        await setCachedData(cacheKey, priceRangeWiseAverageRatingData);
        return handleResponse(res, 200, priceRangeWiseAverageRatingData);
    } catch (error) {
        console.error('Error in getPriceRangeWiseAverageRating:', error);
        return handleResponse(res, 500, { error: 'Failed to fetch price range wise average rating data' });
    }
}