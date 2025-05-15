import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import allowSeller from '../middlewares/authenticateSeller.js';
import {
    getTotalRevenue,
    getCarDescription,
    getPopularCars,
    getCarWiseBookings,
    getNegativeReviews,
    getTopEarningCars,
    getPeakHours,
    getMonthlyBookings,
    getTopCustomers,
    getAverageRentalDuration,
    getRepeatingCustomersPercentage,
    getCityWiseBookings,
    getBiddingComparison,
    getEarningComparison,
    getTotalRevenueByAddons,
    getAverageBidCostPerRental,
    getAverageBookingPayment,
    getSelectedAddonsCount,
    getSellerRating,
    topCitiesWithMostNegativeReviews,
    cityWiseEarnings,
    getPriceRangeAnalytics,
    priceRangeWiseAverageRating
} from '../controllers/sellerAnalytics.controller.js';

const router = express.Router(); 

// Overview Analytics Routes
router.get('/analytics/revenue', protectRoute, allowSeller, getTotalRevenue);
router.get('/analytics/car-description', protectRoute, allowSeller, getCarDescription);
router.get('/analytics/popular-cars', protectRoute, allowSeller, getPopularCars);
router.get('/analytics/total-revenue-by-addons', protectRoute, allowSeller, getTotalRevenueByAddons);
router.get('/analytics/average-bid-cost-per-rental', protectRoute, allowSeller, getAverageBidCostPerRental);
router.get('/analytics/average-booking-payment', protectRoute, allowSeller, getAverageBookingPayment)


// Performance Analytics Routes
router.get('/analytics/car-wise-bookings', protectRoute, allowSeller, getCarWiseBookings);
router.get('/analytics/negative-reviews', protectRoute, allowSeller, getNegativeReviews);
router.get('/analytics/top-earning-cars', protectRoute, allowSeller, getTopEarningCars);
router.get('/analytics/top-city-most-negative-reviews', protectRoute, allowSeller, topCitiesWithMostNegativeReviews);
router.get('/analytics/city-wise-earning', protectRoute, allowSeller, cityWiseEarnings);

// Booking Analytics Routes
router.get('/analytics/peak-hours', protectRoute, allowSeller, getPeakHours);
router.get('/analytics/monthly-bookings', protectRoute, allowSeller, getMonthlyBookings);
router.get('/analytics/top-customers', protectRoute, allowSeller, getTopCustomers);
router.get('/analytics/average-rental-duration', protectRoute, allowSeller, getAverageRentalDuration);
router.get('/analytics/repeating-customers', protectRoute, allowSeller, getRepeatingCustomersPercentage);
router.get('/analytics/city-wise-bookings', protectRoute, allowSeller, getCityWiseBookings);
router.get('/analytics/selected-addons-count', protectRoute, allowSeller, getSelectedAddonsCount)
router.get('/analytics/seller-rating/:id', protectRoute, getSellerRating);
router.get('/analytics/price-range-analytics-bookings', protectRoute, allowSeller, getPriceRangeAnalytics);
router.get('/analytics/price-range-analytics-averageRating', protectRoute, allowSeller,priceRangeWiseAverageRating );


// Comparison Analytics Routes
router.get('/analytics/bidding-comparison', protectRoute, allowSeller, getBiddingComparison);
router.get('/analytics/earning-comparison', protectRoute, allowSeller, getEarningComparison);

    

export default router;