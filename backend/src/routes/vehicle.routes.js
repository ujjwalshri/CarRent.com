import express from 'express'; // import express
import protectRoute from "../middlewares/protectRoute.js"; // import the protectRoute middleware
import {uploadMultipleImages} from '../middlewares/S3.middleware.js';
import allowAdmin from '../middlewares/authenticateAdminRole.js';
import allowSeller from '../middlewares/authenticateSeller.js';


import {addCarController, getAllCarController, getVehicleByStatus, toggleVehicleStatusController, updateVehicleController, getVehicleByIdController, getAllCarsByUser, getPendingCars, listUnlistCarController, getCarsWithBids} from '../controllers/vehicle.controllers.js';// import the addCarController, getAllCarController, and getVehicleByStatus functions from the vehicle.controllers.js file
const router = express.Router(); // create a new router object

router.get('/allApprovedVehicles',getAllCarController ); // get all approved vehicles
router.post('/addVehicle', protectRoute,uploadMultipleImages, addCarController ); // add a vehicle
router.get('/getAllCars',getAllCarController ); // get all vehicles
router.post('/getCarsByStatus', getVehicleByStatus); // get vehicles by status
router.patch('/toggleVehicleStatus/:id',protectRoute,allowAdmin,toggleVehicleStatusController ); // approve a vehicle 
router.patch('/updateVehicle/:id', protectRoute,allowSeller, updateVehicleController); // update a vehicle
router.get('/getVehicle/:id',protectRoute, getVehicleByIdController ); // get a vehicle by id
router.get('/getAllCarsByUser', protectRoute, getAllCarsByUser ); // get all vehicles of a owner
router.get('/getPendingCars', protectRoute,  getPendingCars) // get all pending vehicles
router.patch('/listUnlistCar/:vehicleId', protectRoute,allowSeller,listUnlistCarController ) // list or unlist a vehicle
router.get('/getCarsWithBids',protectRoute, getCarsWithBids) // get all cars with bids

export default router; // export the router object        