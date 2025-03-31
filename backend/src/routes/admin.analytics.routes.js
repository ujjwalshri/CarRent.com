import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import protectFromSeller from '../middlewares/authenticateSeller.js';
import protectFromUser from '../middlewares/authenticateUser.js';
import { getSuvVsSedanCarsController, top10PopularCarModelsController, getTop3MostReviewedCarsController, top3OwnersWithMostCarsAddedController, getOngoingBookingsController , getAverageBookingDurationController, getBiddingConversionRateController, getAllBlockedUsersController, numberOfBiddingsPerCityController, numberOfOwnersPerCityController, getUserDescriptionController,numberOfBuyersPerCityController, getNewUsersInLast30DaysController, addCarCategoryController, getAllCarCategoriesController, deleteCarCategoryController, getUserGrowthController, getUserEngagementPercentageController, top10SellersWithMostEarningsController, sendCongratulationMailController, topBuyersWithMostBookingsController} from '../controllers/admin.controller.js';
const router = express.Router();


router.get('/getSuvVsSedan', protectRoute, protectFromSeller, protectFromUser, getSuvVsSedanCarsController);
router.get('/getTop10MostPopularCars', protectRoute, top10PopularCarModelsController);
router.get('/top3MostReviewedCars', protectRoute, getTop3MostReviewedCarsController);
router.get('/getTop3OwnersWithMostCars', protectRoute,top3OwnersWithMostCarsAddedController );
router.get('/getOngoingBookings', protectRoute, getOngoingBookingsController);
router.get('/getAverageBookingDuration', protectRoute, getAverageBookingDurationController);
router.get('/getBiddingConversionRate', protectRoute, getBiddingConversionRateController);
router.get('/getNumberOfBlockedUsers', protectRoute,getAllBlockedUsersController );
router.get('/numberOfBiddingPerCarCity', protectRoute, numberOfBiddingsPerCityController);
router.get('/numberOfOwnersPerCity', protectRoute, numberOfOwnersPerCityController);
router.get('/getUserDescription', protectRoute, getUserDescriptionController);
router.get('/getnumberOfBuyersPerCity', protectRoute, numberOfBuyersPerCityController);
router.get('/newUsersInLast30Days', protectRoute, getNewUsersInLast30DaysController);
router.post('/addCarCategory', protectRoute,protectFromUser, protectFromSeller, addCarCategoryController);
router.get('/getAllCarCategories', getAllCarCategoriesController);
router.delete('/deleteCarCategory/:categoryID', protectRoute, protectFromUser, protectFromSeller, deleteCarCategoryController);
router.get('/getUserGrowth', protectRoute,getUserGrowthController );
router.get('/getUserEngagementPercentage', protectRoute, getUserEngagementPercentageController);
router.get('/top10SellersWithMostEarnings', protectRoute, top10SellersWithMostEarningsController);
router.get('/topBuyersWithMostBookings', protectRoute, topBuyersWithMostBookingsController);
router.post('/sendCongratulationMail', protectRoute, protectFromUser, protectFromSeller, sendCongratulationMailController);


export default router;