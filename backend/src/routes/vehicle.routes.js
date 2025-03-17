import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import upload from '../config/s3.connection.js';
import {addCarController} from '../controllers/vehicle.controllers.js';
const router = express.Router(); 


router.get('/allApprovedVehicles', );
router.post('/addVehicle', protectRoute, upload.array('images', 5), addCarController );

export default router;