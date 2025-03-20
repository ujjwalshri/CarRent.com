import express from 'express'; // import express
import protectRoute from "../middlewares/protectRoute.js"; // import the protectRoute middleware
import {getAllReviewsAtCarIdController, addReviewController} from '../controllers/review.controllers.js'; // import the getAllReviewsAtCarIdController function from the review.controllers.js file
import protectFromAdmin from '../middlewares/authenticateAdminRole.js';
import protectFromSeller from '../middlewares/authenticateSeller.js';

const router = express.Router(); // create a new router object

router.get('/getAllReviews/car/:id',protectRoute,protectFromAdmin, getAllReviewsAtCarIdController);
router.post('/addReview/car/:id',protectRoute,protectFromAdmin,protectFromSeller,addReviewController);

export default router; // export the router object

