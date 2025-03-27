import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import protectFromUser from '../middlewares/authenticateUser.js';
import protectFromAdmin from '../middlewares/authenticateAdminRole.js';
import {getCarDescriptionController, getTop3MostPopularCarsController, numberOfBiddingsPerLocationController,getTotalCarsAddedController, numberOfBidsOnMyCarsController, getCarCountByFuelTypeController, getTotalRevenueController,getOngoingBookingsController, getMyBidsInLast7DaysVsOtherSellerAvgBidsController, carWiseBookingsController, getMonthWiseBookingsController} from '../controllers/seller.analytics.controller.js';

const router = express.Router();

router.get('/carDescription',protectRoute,protectFromUser,protectFromAdmin,getCarDescriptionController );
router.get('/top3MostPopularCars', protectRoute, protectFromUser, protectFromAdmin, getTop3MostPopularCarsController);
router.get('/numberOfBiddingsPerCarLocation',protectRoute, protectFromUser, protectFromAdmin, numberOfBiddingsPerLocationController);
router.get('/getTotalCarsAdded' , protectRoute, protectFromUser, protectFromAdmin, getTotalCarsAddedController);
router.get('/numberOfBidsOnMyCars', protectRoute, protectFromUser, protectFromAdmin,numberOfBidsOnMyCarsController );
router.get('/getBidsPerLocationType', protectRoute, protectFromUser, protectFromAdmin, getCarCountByFuelTypeController);
router.get('/getTotalBookingRevenue', protectRoute, protectFromUser, protectFromAdmin, getTotalRevenueController);
router.get('/onGoingBookings', protectRoute, protectFromUser, protectFromAdmin,getOngoingBookingsController );
router.get('/myBidsAndOtherSellersAvgBids', protectRoute, protectFromUser, protectFromAdmin, getMyBidsInLast7DaysVsOtherSellerAvgBidsController);
router.get('/getcarWiseBookings', protectRoute, protectFromUser, protectFromAdmin, carWiseBookingsController);
router.get('/getMonthWiseBookings',protectRoute, protectFromUser, protectFromAdmin,  getMonthWiseBookingsController);

export default router;