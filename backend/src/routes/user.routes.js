import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import protectFromUser from '../middlewares/authenticateUser.js';
import protectFromSeller from '../middlewares/authenticateSeller.js';
import {getAllUsers, makeUserSeller, updateUserProfileController, blockUser, unblockUser} from '../controllers/user.controllers.js';
import protectFromAdmin from '../middlewares/authenticateAdminRole.js';
const router = express.Router();

router.get('/getAllUsers', protectRoute,protectFromUser,protectFromSeller, getAllUsers)
router.patch('/blockUser/:userId', blockUser);
router.patch('/unblockUser/:userId', unblockUser)
router.patch('/makeUserSeller/:userId', protectRoute,protectFromUser,protectFromSeller, makeUserSeller);
router.patch('/updateUserProfile', protectRoute,protectFromAdmin,updateUserProfileController);

export default router;