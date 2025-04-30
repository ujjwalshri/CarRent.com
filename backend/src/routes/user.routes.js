import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import {getAllUsers, makeUserSeller, updateUserProfileController, blockUser, unblockUser, getUserAtUserId} from '../controllers/user.controllers.js';
import allowAdmin from '../middlewares/authenticateAdminRole.js';
const router = express.Router();

router.get('/getAllUsers', protectRoute,allowAdmin, getAllUsers) // get all the users
router.patch('/blockUser/:userId', blockUser); // block the user
router.patch('/unblockUser/:userId', unblockUser) // unblock the user
router.patch('/makeUserSeller/:userId', protectRoute,allowAdmin, makeUserSeller); // make the user a seller
router.patch('/updateUserProfile', protectRoute,updateUserProfileController); // update the user profile
router.get('/getUserAtUserId/:userId', protectRoute,getUserAtUserId); // get the user at the userId
export default router;