import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import { 
    getGeneralAnalyticsController,
    getOverviewStatsController, 
    addCarCategoryController, 
    getAllCarCategoriesController, 
    deleteCarCategoryController, 
    topPerformersController, 
    sendCongratulationMailController, 
    usersPerCityController, 
    getCustomerSatisfactionScoreController, 
    updatePriceRangeController, 
    getCurrentPriceRangesController, 
    getChargesController, 
    updateChargesController,
    getCarDescriptionStats,
    getTop10PopularCarModels,
    getTop3MostReviewedCars,
    getTop3OwnersWithMostCars,
    getBiddingsPerCity,
    getUserGrowthStats,
    getHighestEarningCities,
    getNewUsers,
    getTop3CompaniesWithMostNegativeReviews
} from '../controllers/admin.controller.js';
import allowAdmin from '../middlewares/authenticateAdminRole.js';
const router = express.Router();

// Analytics Routes
router.get('/analytics/car-description', protectRoute, allowAdmin, getCarDescriptionStats);
router.get('/analytics/popular-cars', protectRoute, allowAdmin, getTop10PopularCarModels);
router.get('/analytics/most-reviewed', protectRoute, allowAdmin, getTop3MostReviewedCars);
router.get('/analytics/top-owners', protectRoute, allowAdmin, getTop3OwnersWithMostCars);
router.get('/analytics/biddings-per-city', protectRoute, allowAdmin, getBiddingsPerCity);
router.get('/analytics/user-growth', protectRoute, allowAdmin, getUserGrowthStats);
router.get('/analytics/highest-earning-cities', protectRoute, allowAdmin, getHighestEarningCities);
router.get('/analytics/new-users', protectRoute, allowAdmin, getNewUsers);
router.get('/analytics/top-3-companies-with-most-negative-reviews', protectRoute, allowAdmin, getTop3CompaniesWithMostNegativeReviews);

// Existing Routes
router.get('/getGeneralAnalytics', protectRoute, getGeneralAnalyticsController);
router.get('/getOverviewStats', protectRoute, getOverviewStatsController);
router.get('/numberOfUsersPerCity', protectRoute, usersPerCityController);
router.post('/addCarCategory', protectRoute, allowAdmin, addCarCategoryController);
router.get('/getAllCarCategories', getAllCarCategoriesController);
router.delete('/deleteCarCategory/:categoryID', protectRoute, allowAdmin, deleteCarCategoryController);
router.post('/updatePriceRange', protectRoute, allowAdmin, updatePriceRangeController);
router.get('/getCurrentPriceRanges', getCurrentPriceRangesController);
router.get('/topPerformers', protectRoute, topPerformersController);
router.post('/sendCongratulationMail', protectRoute, allowAdmin, sendCongratulationMailController);
router.get('/customerSatisfactionScore', protectRoute, allowAdmin, getCustomerSatisfactionScoreController);
router.get('/getCharges', getChargesController);
router.put('/updateCharges', protectRoute, allowAdmin, updateChargesController);

export default router;