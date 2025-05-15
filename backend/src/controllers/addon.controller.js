/**
 * Add-ons Controller Module
 * 
 * This module handles all add-on related operations for the car rental platform,
 * including creating, retrieving, and deleting add-ons for vehicles.
 * 
 * @module controllers/addon.controller
 */

import AddOns from '../models/add-ons.model.js';

/**
 * Adds a new add-on to the platform
 * @param {Object} req - The request object containing the add-on details
 * @param {Object} res - The response object
 * @returns {Object} The newly created add-on
 */
export const addAddOnsController = async (req, res) => {
    const { name, price } = req.body;
    const owner = {
        _id: req.user._id,
        username: req.user.username
    };
    try{
        const addOns = await AddOns.create({ name, price, owner });
        return res.status(200).json({ addOns });
    }catch(err){
        console.log(`error in the addAddOnsController ${err.message}`);
        return res.status(500).json({error: `error in the addAddOnsController ${err.message}`});
    }
}

/**
 * Retrieves all add-ons for a specific owner
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} The list of add-ons
 */
export const getAllAddOnsController = async (req, res) => {
    const ownerId = req.user._id;
    try{
        const addOns = await AddOns.find({ "owner._id": ownerId, isDeleted: false });
        return res.status(200).json({ addOns });
    }catch(err){
        console.log(`error in the getAllAddOnsController ${err.message}`);
        return res.status(500).json({error: `error in the getAllAddOnsController ${err.message}`});
    }
}

/**
 * Retrieves all add-ons for a specific owner
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} The list of add-ons
 */
export const getAddOnsForUserController = async(req, res) => {
    const ownerId = req.params.ownerId;
    try{
        const addOns = await AddOns.find({ "owner._id": ownerId, isDeleted: false });
        return res.status(200).json({ addOns });
    }catch(err){
        console.log(`error in the getAddOnsForUserController ${err.message}`);
        return res.status(500).json({error: `error in the getAddOnsForUserController ${err.message}`});
    }
}

/**
 * Deletes an add-on by its ID
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} The updated add-on
 */
export const deleteAddOnsController = async (req, res) => {
    const addonId = req.params.addonId;
    try{
        const addOns = await AddOns.findByIdAndUpdate(addonId, { isDeleted: true }, { new: true });
        return res.status(200).json({ addOns });
    }catch(err){
        console.log(`error in the deleteAddOnsController ${err.message}`);
        return res.status(500).json({error: `error in the deleteAddOnsController ${err.message}`});
    }
}