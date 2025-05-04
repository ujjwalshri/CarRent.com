/**
 * Taxes Controller Module
 * 
 * This module handles all tax-related operations for the car rental platform,
 * including creating, retrieving, updating, and deleting tax entries.
 * Used by the admin to manage platform taxes.
 * 
 * @module controllers/taxes.controller
 */

import Tax from '../models/taxes.model.js';

/**
 * Get All Taxes
 * 
 * Retrieves all tax entries from the database
 * 
 * @async
 * @function getAllTaxesController
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with taxes array or error message
 */
export const getAllTaxesController = async (req, res) => {
    try {
        
        const taxes = await Tax.find().sort({ createdAt: -1 });
        return res.status(200).json(taxes);
    } catch (err) {
        console.error(`Error in getAllTaxesController: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Add New Tax
 * 
 * Creates a new tax entry in the database
 * 
 * @async
 * @function addTaxController
 * @param {Object} req - Express request object
 * @param {Object} req.body - Tax data
 * @param {string} req.body.name - Tax name
 * @param {string} req.body.type - Tax type (percentage/fixed)
 * @param {number} req.body.value - Tax value
 * @param {boolean} req.body.isActive - Whether tax is active
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new tax or error message
 */
export const addTaxController = async (req, res) => {
    try {
        const { name, type, value, isActive } = req.body;
        
        // Validation
        if (!name || !type || value === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        if (type !== 'percentage' && type !== 'fixed') {
            return res.status(400).json({ message: "Type must be either 'percentage' or 'fixed'" });
        }
        
        if (type === 'percentage' && (value < 0 || value > 100)) {
            return res.status(400).json({ message: "Percentage value must be between 0 and 100" });
        }
        
        if (type === 'fixed' && value < 0) {
            return res.status(400).json({ message: "Fixed value cannot be negative" });
        }
        
        const newTax = await Tax.create({
            name,
            type,
            value,
            isActive: isActive !== undefined ? isActive : true
        });
        

        return res.status(201).json(newTax);
    } catch (err) {
        console.error(`Error in addTaxController: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Update Tax
 * 
 * Updates an existing tax entry in the database
 * 
 * @async
 * @function updateTaxController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.taxId - ID of the tax to update
 * @param {Object} req.body - Updated tax data
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated tax or error message
 */
export const updateTaxController = async (req, res) => {
    try {
        const { taxId } = req.params;
        const { name, type, value, isActive } = req.body;
        
        // Validation for type and value if they're being updated
        if (type && type !== 'percentage' && type !== 'fixed') {
            return res.status(400).json({ message: "Type must be either 'percentage' or 'fixed'" });
        }
        
        if (type === 'percentage' && value !== undefined && (value < 0 || value > 100)) {
            return res.status(400).json({ message: "Percentage value must be between 0 and 100" });
        }
        
        if (type === 'fixed' && value !== undefined && value < 0) {
            return res.status(400).json({ message: "Fixed value cannot be negative" });
        }
        
        const updatedTax = await Tax.findByIdAndUpdate(
            taxId,
            { 
                name, 
                type, 
                value, 
                isActive,
                updatedAt: Date.now() 
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedTax) {
            return res.status(404).json({ message: "Tax not found" });
        }
        


        
        return res.status(200).json(updatedTax);
    } catch (err) {
        console.error(`Error in updateTaxController: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Delete Tax
 * 
 * Deletes a tax entry from the database
 * 
 * @async
 * @function deleteTaxController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.taxId - ID of the tax to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with deleted tax or error message
 */
export const deleteTaxController = async (req, res) => {
    try {
        const { taxId } = req.params;
        
        const deletedTax = await Tax.findByIdAndDelete(taxId);
        
        if (!deletedTax) {
            return res.status(404).json({ message: "Tax not found" });
        }
        


        
        return res.status(200).json({ message: "Tax deleted successfully", deletedTax });
    } catch (err) {
        console.error(`Error in deleteTaxController: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Toggle Tax Status
 * 
 * Toggles the active status of a tax entry
 * 
 * @async
 * @function toggleTaxStatusController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.taxId - ID of the tax to toggle
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated tax or error message
 */
export const toggleTaxStatusController = async (req, res) => {
    try {
        const { taxId } = req.params;
        
        const tax = await Tax.findById(taxId);
        
        if (!tax) {
            return res.status(404).json({ message: "Tax not found" });
        }
        
        tax.isActive = !tax.isActive;
        await tax.save();

        return res.status(200).json(tax);
    } catch (err) {
        console.error(`Error in toggleTaxStatusController: ${err.message}`);
        return res.status(500).json({ message: "Internal server error" });
    }
};