import express from 'express'; // import express
import protectRoute from "../middlewares/protectRoute.js"; // import the protectRoute middleware
import {getAllReviewsAtCarIdController, addReviewController} from '../controllers/review.controllers.js'; // import the getAllReviewsAtCarIdController function from the review.controllers.js file

const router = express.Router(); // create a new router object

router.get('/getAllReviews/car/:id',protectRoute, getAllReviewsAtCarIdController); // get all the reviews at car id
router.post('/addReview/car/:id',protectRoute,addReviewController); // add the review

export default router; // export the router object