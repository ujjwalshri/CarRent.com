import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import allowAdmin from '../middlewares/authenticateAdminRole.js';
import { 
    getAllTaxesController, 
    addTaxController, 
    updateTaxController,
    deleteTaxController,
    toggleTaxStatusController
} from '../controllers/taxes.controller.js';

const router = express.Router();

// Get all taxes - accessible to all users (will be needed for calculating final prices)
router.get('/getAllTaxes', getAllTaxesController);

// Admin-only routes
router.post('/addTax', protectRoute, allowAdmin, addTaxController);
router.put('/updateTax/:taxId', protectRoute, allowAdmin, updateTaxController);
router.delete('/deleteTax/:taxId', protectRoute, allowAdmin, deleteTaxController);
router.patch('/toggleTaxStatus/:taxId', protectRoute, allowAdmin, toggleTaxStatusController);

export default router;