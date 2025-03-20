import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import protectFromUser from '../middlewares/authenticateUser.js';
import protectFromSeller from '../middlewares/authenticateSeller.js';
import {getAllUsers, blockUnblockUser, makeUserSeller} from '../controllers/user.controllers.js';

const router = express.Router();

router.get('/getAllUsers', protectRoute,protectFromUser,protectFromSeller, getAllUsers)
router.patch('/blockUnblockUser/:userId', protectRoute,protectFromUser,protectFromSeller, blockUnblockUser);
router.patch('/makeUserSeller/:userId', protectRoute,protectFromUser,protectFromSeller, makeUserSeller);

export default router;