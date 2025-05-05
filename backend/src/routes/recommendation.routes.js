import express from 'express';
import { get } from 'mongoose';
import protectRoute from '../middlewares/protectRoute.js';
import { getVehicleRecommendationController , getOptimalBidRecommendationsController} from '../controllers/recommendation.controller.js';

const router = express.Router();

router.get('/vehicleRecommendation',protectRoute,  getVehicleRecommendationController);
router.get('/optimalBidsRecommendation',protectRoute,  getOptimalBidRecommendationsController); // get the vehicle recommendation based on the city

export default router;

