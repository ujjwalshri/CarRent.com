import express from 'express'; // import express
import protectRoute from "../middlewares/protectRoute.js"; // import the protectRoute middleware
import upload from '../config/s3.connection.js'; // import the upload object from the s3.connection.js file
import {addCarController, getAllCarController, getVehicleByStatus, toggleVehicleStatusController, updateVehicleController, getVehicleByIdController} from '../controllers/vehicle.controllers.js';// import the addCarController, getAllCarController, and getVehicleByStatus functions from the vehicle.controllers.js file

const router = express.Router(); // create a new router object

router.get('/allApprovedVehicles',getAllCarController ); // get all approved vehicles
router.post('/addVehicle', protectRoute, upload.array('images', 5), addCarController ); // add a vehicle
router.get('/getAllCars',getAllCarController ); // get all vehicles
router.post('/getCarsByStatus', getVehicleByStatus); // get vehicles by status
router.post('/toggleVehicleStatus/:id',protectRoute,toggleVehicleStatusController ); // approve a vehicle 
router.put('/updateVehicle/:id', protectRoute, updateVehicleController); // update a vehicle
router.get('/getVehicle/:id', protectRoute, getVehicleByIdController ); // get a vehicle by id

export default router; // export the router object