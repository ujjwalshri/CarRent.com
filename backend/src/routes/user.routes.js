import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import {getAllUsers, blockUnblockUser, makeUserSeller} from '../controllers/user.controllers.js';

const router = express.Router();

router.get('/getAllUsers', protectRoute, getAllUsers)
router.patch('/blockUnblockUser/:userId', protectRoute, blockUnblockUser);
router.patch('/makeUserSeller/:userId', protectRoute, makeUserSeller);

export default router;