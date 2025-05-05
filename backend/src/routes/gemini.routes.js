import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import allowSeller from '../middlewares/authenticateSeller.js';
import { getReviewSummaryController } from '../controllers/gemini.controller.js';

const router = express.Router();

router.get('/review-summary', protectRoute, allowSeller, getReviewSummaryController);

export default router;