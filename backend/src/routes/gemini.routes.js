import express from 'express';
import GeminiService from '../services/gemini.service.js';

const router = express.Router();
const geminiService = new GeminiService();
// route to get the optimal bid for a particular vehicle
router.post('/getOptimalBids/:vehicleId', async (req, res) => {
    const { vehicleId } = req.params;
    try {
        const optimalBid = await geminiService.getOptimalBid(vehicleId);
        res.json({ optimalBid });
    } catch (error) {
        console.error('Error in getOptimalBid route:', error);
        res.status(500).json({ error: 'Failed to get optimal bid' });
    }
});


export default router;