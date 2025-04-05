import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import allowSeller from '../middlewares/authenticateSeller.js';
import {getCarDescriptionController, getTop3MostPopularCarsController, numberOfBiddingsPerLocationController,getTotalCarsAddedController, numberOfBidsOnMyCarsController, getCarCountByFuelTypeController, getTotalRevenueController,getOngoingBookingsController, getMyBidsVsOtherSellerAvgBidsController, carWiseBookingsController, getMonthWiseBookingsController, top3CarsWithMostEarningController, top3CostumersWithMostBookingsController, peakBiddingHoursController, getNegativeReviewsPercentageController, getAverageRentalDurationController, getRepeatingCustomerPercentageController, numberOfBookingsController, getCarWiseNegativeReviewsController} from '../controllers/seller.analytics.controller.js';

const router = express.Router();

router.get('/carDescription',protectRoute,allowSeller,getCarDescriptionController ); // get the car description
router.get('/top3MostPopularCars', protectRoute, allowSeller, getTop3MostPopularCarsController); // get the top 3 most popular cars
router.get('/numberOfBiddingsPerCarLocation',protectRoute, allowSeller, numberOfBiddingsPerLocationController); // get the number of biddings per car location
router.get('/getTotalCarsAdded' , protectRoute, allowSeller, getTotalCarsAddedController); // get the total cars added
router.get('/numberOfBidsOnMyCars', protectRoute, allowSeller,numberOfBidsOnMyCarsController );// get the number of bids on my cars
router.get('/getBidsPerLocationType', protectRoute, allowSeller, getCarCountByFuelTypeController); // get the car count by fuel type
router.get('/getTotalBookingRevenue', protectRoute, allowSeller, getTotalRevenueController); // get the total booking revenue
router.get('/onGoingBookings', protectRoute,allowSeller,getOngoingBookingsController ); // get the ongoing bookings
router.get('/myBidsAndOtherSellersAvgBids', protectRoute,allowSeller, getMyBidsVsOtherSellerAvgBidsController); // get the my bids and other sellers avg bids
router.get('/getcarWiseBookings', protectRoute,allowSeller, carWiseBookingsController); // get the car wise bookings 
router.get('/getMonthWiseBookings',protectRoute, allowSeller, getMonthWiseBookingsController); // get the month wise bookings
router.get('/top3CarsWithMostEarning', protectRoute, allowSeller, top3CarsWithMostEarningController); // get the top 3 cars with most earning
router.get('/top3CostumersWithMostBookings', protectRoute, allowSeller, top3CostumersWithMostBookingsController); // get the top 3 costumers with most bookings
router.get('/peakBiddingHours', protectRoute, allowSeller, peakBiddingHoursController); // get the peak bidding hours
router.get('/getNegativeReviewsPercentage', protectRoute,allowSeller, getNegativeReviewsPercentageController); // get the negative reviews percentage
router.get('/getAverageRentalDuration', protectRoute, allowSeller, getAverageRentalDurationController); // get the average rental duration
router.get('/getRepeatingCustomersPercentage', protectRoute, allowSeller, getRepeatingCustomerPercentageController) // get the repeating customer percentage
router.get('/numberOfBookings', protectRoute, allowSeller, numberOfBookingsController); // get the number of bookings
router.get('/getCarWiseNegativeReviews', protectRoute, allowSeller, getCarWiseNegativeReviewsController); // get the car wise negative reviews

export default router; // export the router