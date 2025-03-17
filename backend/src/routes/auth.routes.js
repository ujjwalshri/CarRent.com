import express from "express";
import {signupController, loginController, logoutController, meController} from "../controllers/auth.controllers.js";
import protectRoute from "../middlewares/protectRoute.js";
const app = express();

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/logout', protectRoute, logoutController);
router.get('/me', protectRoute, meController);

export default router;