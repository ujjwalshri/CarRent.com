import express from "express"; // importing express
import {signupController, loginController, logoutController, meController, verifyEmailController, resendVerificationEmailController} from "../controllers/auth.controllers.js"; // importing the signupController, loginController, logoutController, and meController functions from the auth.controllers.js file
import protectRoute from "../middlewares/protectRoute.js"; // importing the protectRoute middleware


const router = express.Router(); // creating a new router object

router.post('/signup', signupController); // route to signup
router.post('/login', loginController); // route to login
router.post('/logout', protectRoute, logoutController); // route to logout
router.get('/me', protectRoute, meController); // route to get the logged in user
router.get('/verify/:token', verifyEmailController); // route to verify email
router.post('/resendVerificationEmail',resendVerificationEmailController ); // route to resend verification email
export default router;
