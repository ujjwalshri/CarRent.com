import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import { getChartsDataController , getGeneralAnalyticsController,getOverviewStatsController, addCarCategoryController, getAllCarCategoriesController, deleteCarCategoryController, topPerformersController, sendCongratulationMailController, usersPerCityController, getCustomerSatisfactionScoreController, updatePriceRangeController, getCurrentPriceRangesController, getChargesController, updateChargesController} from '../controllers/admin.controller.js';
import allowAdmin from '../middlewares/authenticateAdminRole.js';
const router = express.Router();

router.get('/charts', protectRoute, allowAdmin, getChartsDataController); // get the car description
router.get('/getGeneralAnalytics', protectRoute, getGeneralAnalyticsController); // get the average booking duration
router.get('/getOverviewStats', protectRoute, getOverviewStatsController); // get the bidding conversion rate
router.get('/numberOfUsersPerCity', protectRoute, usersPerCityController); // get the number of owners per city
router.post('/addCarCategory', protectRoute,allowAdmin, addCarCategoryController); // add the car category
router.get('/getAllCarCategories', getAllCarCategoriesController); // get all the car categories
router.delete('/deleteCarCategory/:categoryID', protectRoute, allowAdmin, deleteCarCategoryController); // delete the car category
router.post('/updatePriceRange', protectRoute, allowAdmin, updatePriceRangeController); // add the price range
router.get('/getCurrentPriceRanges', getCurrentPriceRangesController); // get the current price ranges
router.get('/topPerformers', protectRoute, topPerformersController); // get the top 10 sellers with most earnings
router.post('/sendCongratulationMail', protectRoute, allowAdmin, sendCongratulationMailController); // send the congratulation mail
router.get('/customerSatisfactionScore', protectRoute, allowAdmin, getCustomerSatisfactionScoreController); // get the customer satisfaction score
router.get('/getCharges', getChargesController); // get the charges
router.put('/updateCharges', protectRoute, allowAdmin, updateChargesController); // update the charges
export default router;