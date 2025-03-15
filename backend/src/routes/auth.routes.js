import express from "express";
import {signupController, loginController, logoutController} from "../controllers/auth.controllers.js";
import protectRoute from "../middlewares/protectRoute.js";
const app = express();

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', protectRoute, logoutController);

export default router;