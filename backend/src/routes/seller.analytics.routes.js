import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import allowSeller from '../middlewares/authenticateSeller.js';
import {
    getOverviewAnalytics,
    getPerformanceAnalytics,
    getBookingAnalytics
} from '../controllers/seller.analytics.controller.js';

const router = express.Router();

// Grouped analytics routes
router.get('/overview', protectRoute, allowSeller, getOverviewAnalytics); // Overview stats, revenue, bookings count
router.get('/performance', protectRoute, allowSeller, getPerformanceAnalytics); // Car performance, reviews, earnings
router.get('/bookings', protectRoute, allowSeller, getBookingAnalytics); // Booking patterns, customer data

export default router;