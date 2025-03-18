import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {addBidController, updateBidStatusController} from "../controllers/bidding.controller.js";


const router = express.Router();

router.post('/addBid', protectRoute, addBidController); // route to add a bid
router.patch('/updateBookingStatus/:id', protectRoute, updateBidStatusController); // route to toggle the booking status
router.get('/getBid/owner', protectRoute); // route to get the bid at user id



export default router;