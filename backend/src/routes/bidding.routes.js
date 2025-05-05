import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {addBidController,
     updateBidStatusController,
     getBidForOwnerController,
     getBidForUserController,
     getBookingsAtCarIdController,
     getAllBookingsAtOwnerIdController,
     getAllBookingsAtUserIdController,
     getUserBookingHistory,
     getBookingAtBookingIdController,
     startBookingController,
     endBookingController, 
     reviewBookingController, 
     getOverlappingBidsController} from "../controllers/bidding.controller.js";
import allowUser from "../middlewares/authenticateUser.js";
import allowSeller from "../middlewares/authenticateSeller.js";
const router = express.Router();

router.post('/addBid/:carId', protectRoute,allowUser,addBidController); // route to add a bid
router.patch('/updateBookingStatus/:id', protectRoute, updateBidStatusController); // route to toggle the booking status
router.get('/getBids/owner', protectRoute,allowSeller, getBidForOwnerController); // route to get the bid at user id
router.get('/getBids/user', protectRoute, getBidForUserController); // route to get the bid at loggedin user id
router.get('/getBookings/car/:carId', protectRoute,getBookingsAtCarIdController); // get all bookings at car id
router.get('/getBookings/owner', protectRoute, allowSeller, getAllBookingsAtOwnerIdController); // get all bookings at owner id
router.get('/getBookings/user',protectRoute, allowUser, getAllBookingsAtUserIdController); // get all bookings at user id
router.get('/getBookingsHistory/user', protectRoute ,getUserBookingHistory ); // get all bookings at user id
router.get('/getBid/:bookingId', protectRoute, allowSeller, getBookingAtBookingIdController); // get all bids at bidding id
router.patch('/startBooking/:bookingId', protectRoute, allowSeller, startBookingController); // start the booking
router.patch('/endBooking/:bookingId', protectRoute, allowSeller, endBookingController); // end the booking
router.patch('/reviewBooking/:bookingId',reviewBookingController) // review the booking  


router.get('/getOverlappingBids/:id', protectRoute, allowSeller, getOverlappingBidsController) // get the overlapping bids
export default router;