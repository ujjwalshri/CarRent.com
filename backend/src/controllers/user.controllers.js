import mongoose from "mongoose";
import User from "../models/user.model.js"; 
import Vehicle from "../models/vehicle.model.js";

/**
 * Retrieves all users from the database, excluding the admin user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with users and pagination details
 */
export const getAllUsers = async (req, res) => {
    const { city, search, skip=0, limit=10, userType='seller' } = req.query;
    const adminId = req.user._id;
    
    try {
        let pipeline = [];

        // Build match conditions
        let matchConditions = { _id: { $ne: adminId } };
        
        // Add city filter if provided
        if (city) {
            matchConditions.city = city;
        }
        
        // Add user type filter
        if (userType === 'seller') {
            matchConditions.isSeller = true;
        } else if (userType === 'buyer') {
            matchConditions.isSeller = false;
        } else {
            // Default to seller if an invalid value is provided
            matchConditions.isSeller = true;
        }
        
        // Add search stage if search query exists
        if (search) {
            pipeline.push({
                $search: {
                    index: "userIndex", 
                    autocomplete: {
                        query: search,
                        path: "username",
                        fuzzy: { }
                    }
                }
            });
        }

        // Add match stage
        pipeline.push({
            $match: matchConditions
        });

        // Add facet for pagination
        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: parseInt(skip) },
                    { $limit: parseInt(limit) }
                ]
            }
        });

        const result = await User.aggregate(pipeline);
        
        // Extract total count and data
        const total = result[0].metadata[0]?.total || 0;
        const users = result[0].data;

        return res.status(200).json({ 
            message: 'Users found', 
            users,
            pagination: {
                total,
                page: Math.floor(skip / limit) + 1,
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(`Error in getAllUsers: ${error.message}`);
        return res.status(500).json({ message: `Error in getAllUsers: ${error.message}` });
    }
};

/**
 * Blocks a user and marks their cars as deleted uses transactions to ensure data consistency
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID to block
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
export const blockUser = async (req, res) => {
    const { userId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Block the user by setting `blocked = true`
        const user = await User.findByIdAndUpdate(
            userId,
            { isBlocked: true },
            { new: true, session }
        );

        // Fetch all cars belonging to the user and set `deleted = true`
        await Vehicle.updateMany(
            { 'owner._id' : userId },
            { deleted: true },
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: 'User blocked and their cars marked as deleted' });
    } catch (err) {
        // Abort the transaction in case of an error
        await session.abortTransaction();
        session.endSession();

        console.log(`Error in blockUser: ${err.message}`);
        return res.status(500).json({ error: `Error in blockUser: ${err.message}` });
    }
};

/**
 * Makes a user a seller
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID to make a seller
 * @param {Object} res - Express response object
 */
export const makeUserSeller = async(req, res)=>{
    const {userId} = req.params;
    if(!userId){
        return res.status(400).json({message: 'userId is required'});
    }
    try {
        const user = User.updateOne({_id: userId}, {isSeller: true});
        return res.status(200).json({message: 'User is now a seller'});
    }catch(err){
        console.log(`error in the makeUserSeller ${err.message}`);
        res.status(500).json({message: `error in the makeUserSeller ${err.message}`});
    }
}

/**
 * Updates the user profile
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID to update the profile
 * @param {Object} res - Express response object
 */
export const updateUserProfileController = async (req, res) => {
    const userId = req.user._id;
   
    const { firstName, lastName, city } = req.body;

    if (!firstName || !lastName || !city) {
        return res.status(400).json({ message: 'All fields (firstName, lastName, city) are required' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    firstName,
                    lastName,
                    city
                },
            },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    } catch (err) {
        console.log(`Error in the updateUserProfileController: ${err.message}`);
        return res.status(500).json({ message: `Error in the updateUserProfileController: ${err.message}` });
    }
};

/**
 * Updates only the user's city
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.city - New city value
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user data
 */
export const updateUserCityController = async (req, res) => {
    const userId = req.user._id;
    const { city } = req.body;

    if (!city) {
        return res.status(400).json({ message: 'City is required' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { city },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ 
            message: 'User city updated successfully', 
            user: updatedUser 
        });
    } catch (err) {
        console.log(`Error updating user city: ${err.message}`);
        return res.status(500).json({ message: `Error updating user city: ${err.message}` });
    }
};

/**
 * @description: function to get the user at the userId
 * @param {string} userId - the userId of the user to get   
 * @returns {object} - the user object
 */
export const getUserAtUserId = async (req, res) => {
    const {userId} = req.params;
    try {
        const user = await User.findById(userId).select('-password -adhaar');
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(200).json({message: 'User found', user});
    }catch(err){
        console.log(`Error in the getUserAtUserId: ${err.message}`);
        return res.status(500).json({message: `Error in the getUserAtUserId: ${err.message}`});
    }
}

/**
 * Unblocks a user and marks their cars as not deleted
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID to unblock
 * @param {Object} res - Express response object
 */
export const unblockUser = async (req, res) => {
    const { userId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Block the user by setting `blocked = true`
        const user = await User.findByIdAndUpdate(
            userId,
            { isBlocked: false },
            { new: true, session }
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Fetch all cars belonging to the user and set `deleted = true`
        await Vehicle.updateMany(
            { 'owner._id' : userId },
            { deleted: false },
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: 'User blocked and their cars marked as deleted' });
    } catch (err) {
        // Abort the transaction in case of an error
        await session.abortTransaction();
        session.endSession();

        console.log(`Error in blockUser: ${err.message}`);
        return res.status(500).json({ error: `Error in blockUser: ${err.message}` });
    }
};
