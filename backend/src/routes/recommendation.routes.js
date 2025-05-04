import express from 'express';
import { get } from 'mongoose';
import protectRoute from '../middlewares/protectRoute.js';
import { getVehicleRecommendationController } from '../controllers/recommendation.controller.js';

const router = express.Router();

router.get('/vehicleRecommendation',protectRoute,  getVehicleRecommendationController);

export default router;

