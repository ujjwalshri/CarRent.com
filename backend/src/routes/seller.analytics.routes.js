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
    getEarningComparison
} from '../controllers/seller.analytics.controller.js';

const router = express.Router(); 

// Overview Analytics Routes
router.get('/analytics/revenue', protectRoute, allowSeller, getTotalRevenue);
router.get('/analytics/car-description', protectRoute, allowSeller, getCarDescription);
router.get('/analytics/popular-cars', protectRoute, allowSeller, getPopularCars);

// Performance Analytics Routes
router.get('/analytics/car-wise-bookings', protectRoute, allowSeller, getCarWiseBookings);
router.get('/analytics/negative-reviews', protectRoute, allowSeller, getNegativeReviews);
router.get('/analytics/top-earning-cars', protectRoute, allowSeller, getTopEarningCars);

// Booking Analytics Routes
router.get('/analytics/peak-hours', protectRoute, allowSeller, getPeakHours);
router.get('/analytics/monthly-bookings', protectRoute, allowSeller, getMonthlyBookings);
router.get('/analytics/top-customers', protectRoute, allowSeller, getTopCustomers);
router.get('/analytics/average-rental-duration', protectRoute, allowSeller, getAverageRentalDuration);
router.get('/analytics/repeating-customers', protectRoute, allowSeller, getRepeatingCustomersPercentage);
router.get('/analytics/city-wise-bookings', protectRoute, allowSeller, getCityWiseBookings);

// Comparison Analytics Routes
router.get('/analytics/bidding-comparison', protectRoute, allowSeller, getBiddingComparison);
router.get('/analytics/earning-comparison', protectRoute, allowSeller, getEarningComparison);

export default router;