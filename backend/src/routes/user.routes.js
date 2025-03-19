import express from 'express';
import protectRoute from "../middlewares/protectRoute.js";
import {getAllUsers, blockUnblockUser} from '../controllers/user.controllers.js';

const router = express.Router();

router.get('/getAllUsers', protectRoute, getAllUsers)
router.patch('/blockUnblockUser/:userId', protectRoute, blockUnblockUser);

export default router;