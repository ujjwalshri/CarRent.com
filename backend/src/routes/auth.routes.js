import express from "express"; // importing express
import {signupController, loginController, logoutController, meController, verifyEmailController} from "../controllers/auth.controllers.js"; // importing the signupController, loginController, logoutController, and meController functions from the auth.controllers.js file
import protectRoute from "../middlewares/protectRoute.js"; // importing the protectRoute middleware


const router = express.Router(); // creating a new router object

router.post('/signup', signupController); // route to signup
router.post('/login', loginController); // route to login
router.post('/logout', protectRoute, logoutController); // route to logout
router.get('/me', protectRoute, meController); // route to get the logged in user
router.get('/verify/:token', verifyEmailController); // route to verify email

export default router;
