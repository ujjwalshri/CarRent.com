import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {addBidController, updateBidStatusController, getBidForOwnerController, getBidForUserController,getAllBids, getBookingsAtCarIdController } from "../controllers/bidding.controller.js";
import protectFromAdmin from "../middlewares/authenticateAdminRole.js";
import protectFromSeller from "../middlewares/authenticateSeller.js";
import protectFromUser from "../middlewares/authenticateUser.js";
const router = express.Router();

router.post('/addBid/:carId', protectRoute,protectFromAdmin,protectFromSeller,addBidController); // route to add a bid
router.patch('/updateBookingStatus/:id', protectRoute,protectFromUser, updateBidStatusController); // route to toggle the booking status
router.get('/getBids/owner', protectRoute,protectFromAdmin,protectFromUser, getBidForOwnerController); // route to get the bid at user id
router.get('/getBids/user', protectRoute,protectFromAdmin, getBidForUserController); // route to get the bid at user id
router.get('/getBookings/car/:carId', protectRoute,getBookingsAtCarIdController); // get all biddings at car id

export default router;