import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import { getChartsDataController , getGeneralAnalyticsController,getOverviewStatsController, addCarCategoryController, getAllCarCategoriesController, deleteCarCategoryController, topPerformersController, sendCongratulationMailController, usersPerCityController} from '../controllers/admin.controller.js';
import allowAdmin from '../middlewares/authenticateAdminRole.js';
const router = express.Router();

router.get('/charts', protectRoute, allowAdmin, getChartsDataController); // get the car description
router.get('/getGeneralAnalytics', protectRoute, getGeneralAnalyticsController); // get the average booking duration
router.get('/getOverviewStats', protectRoute, getOverviewStatsController); // get the bidding conversion rate
router.get('/numberOfUsersPerCity', protectRoute, usersPerCityController); // get the number of owners per city
router.post('/addCarCategory', protectRoute,allowAdmin, addCarCategoryController); // add the car category
router.get('/getAllCarCategories', getAllCarCategoriesController); // get all the car categories
router.delete('/deleteCarCategory/:categoryID', protectRoute, allowAdmin, deleteCarCategoryController); // delete the car category
router.get('/topPerformers', protectRoute, topPerformersController); // get the top 10 sellers with most earnings
router.post('/sendCongratulationMail', protectRoute, allowAdmin, sendCongratulationMailController); // send the congratulation mail

export default router;