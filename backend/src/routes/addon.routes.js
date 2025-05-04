/**
 * Add-ons Router Module
 * 
 * This module defines the API routes for add-on related operations,
 * including creating, retrieving, and deleting add-ons.
 * 
 * @module routes/addon.routes
 */

import express from 'express';
import { 
    addAddOnsController, 
    getAllAddOnsController, 
    getAddOnsForUserController, 
    deleteAddOnsController 
} from '../controllers/addon.controller.js';
import authenticateSeller from '../middlewares/authenticateSeller.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

// Routes that require seller authentication
router.post('/', protectRoute, authenticateSeller, addAddOnsController);
router.get('/owner', protectRoute, authenticateSeller, getAllAddOnsController);
router.delete('/:addonId', protectRoute, authenticateSeller, deleteAddOnsController);

// Routes that any authenticated user can access
router.get('/owner/:ownerId', protectRoute, getAddOnsForUserController);

export default router;