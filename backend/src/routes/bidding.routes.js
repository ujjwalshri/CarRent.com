import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {addBidController, updateBidStatusController, getBidForOwnerController, getBidForUserController,getAllBids, getBookingsAtCarIdController, getAllBookingsAtOwnerIdController ,getAllBookingsAtUserIdController, getUserBookingHistory, getBookingAtBookingIdController, startBookingController, endBookingController , reviewBookingController, bookingRecommendationController} from "../controllers/bidding.controller.js";
import protectFromAdmin from "../middlewares/authenticateAdminRole.js";
import protectFromSeller from "../middlewares/authenticateSeller.js";
import protectFromUser from "../middlewares/authenticateUser.js";
const router = express.Router();

router.post('/addBid/:carId', protectRoute,protectFromAdmin,protectFromSeller,addBidController); // route to add a bid
router.patch('/updateBookingStatus/:id', protectRoute, updateBidStatusController); // route to toggle the booking status
router.get('/getBids/owner', protectRoute,protectFromAdmin,protectFromUser, getBidForOwnerController); // route to get the bid at user id
router.get('/getBids/user', protectRoute,protectFromAdmin, getBidForUserController); // route to get the bid at loggedin user id
router.get('/getBookings/car/:carId', protectRoute,getBookingsAtCarIdController); // get all bookings at car id
router.get('/getBookings/owner', protectRoute, protectFromAdmin, protectFromUser, getAllBookingsAtOwnerIdController); // get all bookings at owner id
router.get('/getBookings/user',protectRoute, protectFromAdmin, protectFromSeller, getAllBookingsAtUserIdController); // get all bookings at user id
router.get('/getBookingsHistory/user', protectRoute, protectFromAdmin,getUserBookingHistory ); // get all bookings at user id
router.get('/getBid/:bookingId', protectRoute, protectFromUser, protectFromAdmin, getBookingAtBookingIdController); // get all bids at bidding id
router.patch('/startBooking/:bookingId', protectRoute, protectFromUser, protectFromAdmin, startBookingController); // start the booking
router.patch('/endBooking/:bookingId', protectRoute, protectFromUser, protectFromAdmin, endBookingController); // end the booking
router.patch('/reviewBooking/:bookingId',   reviewBookingController)
router.get('/getCarRecommendation', protectRoute, bookingRecommendationController)
export default router;