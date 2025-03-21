import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import protectFromSeller from '../middlewares/authenticateSeller.js';
import protectFromUser from '../middlewares/authenticateUser.js';
import {monthlyTripsController} from '../controllers/admin.controller.js';
const router = express.Router();

router.get('/getMonthlyTrips',protectRoute,protectFromSeller,protectFromUser, monthlyTripsController);


export default router;