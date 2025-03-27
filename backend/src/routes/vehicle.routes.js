import express from 'express'; // import express
import protectRoute from "../middlewares/protectRoute.js"; // import the protectRoute middleware
import upload from '../config/s3.connection.js'; // import the multer middleware
import protectFromAdmin from '../middlewares/authenticateAdminRole.js';
import protectFromUser from '../middlewares/authenticateUser.js';
import protectFromSeller from '../middlewares/authenticateSeller.js';

import {addCarController, getAllCarController, getVehicleByStatus, toggleVehicleStatusController, updateVehicleController, getVehicleByIdController, getAllCarsByUser, getPendingCars, listUnlistCarController} from '../controllers/vehicle.controllers.js';// import the addCarController, getAllCarController, and getVehicleByStatus functions from the vehicle.controllers.js file

const router = express.Router(); // create a new router object

router.get('/allApprovedVehicles',getAllCarController ); // get all approved vehicles
router.post('/addVehicle', protectRoute,protectFromAdmin,upload.array('images', 5), addCarController ); // add a vehicle
router.get('/getAllCars',getAllCarController ); // get all vehicles
router.post('/getCarsByStatus', getVehicleByStatus); // get vehicles by status
router.patch('/toggleVehicleStatus/:id',protectRoute,protectFromUser, protectFromSeller,toggleVehicleStatusController ); // approve a vehicle 
router.patch('/updateVehicle/:id', protectRoute,protectFromUser, protectFromAdmin, updateVehicleController); // update a vehicle
router.get('/getVehicle/:id',protectRoute,protectFromAdmin, getVehicleByIdController ); // get a vehicle by id
router.get('/getAllCarsByUser', protectRoute,protectFromAdmin, getAllCarsByUser ); // get all vehicles of a owner
router.get('/getPendingCars', protectRoute,  getPendingCars)
router.patch('/listUnlistCar/:vehicleId', protectRoute,protectFromUser,protectFromAdmin,listUnlistCarController )

export default router; // export the router object