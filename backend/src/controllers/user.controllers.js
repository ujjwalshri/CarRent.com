import mongoose from "mongoose";
import User from "../models/user.model.js"; 
import Vehicle from "../models/vehicle.model.js";

/*
@description:  function to get all the users from the database implemented filtering using the search query
*/
export const getAllUsers = async (req, res) => {
    const { city, search, skip=0, limit=10 } = req.query;


    try {
        let pipeline = [];

     
        if (search) {
            pipeline.push({
                $search: {
                    index: "userIndex", 
                    autocomplete: {
                        query: search,
                        path:  "username",
                        fuzzy: {  }
                    }
                }
            });
        }


        if (city) {
            pipeline.push({
                $match: { city }
            });
        }


        pipeline.push({
            $match: { username: { $ne: 'ujjwal@123' } }
        });

        pipeline.push({
            $skip: parseInt(skip)
        });

        pipeline.push({
            $limit: parseInt(limit)
        });

        const users = await User.aggregate(pipeline);

        return res.status(200).json({ message: 'Users found', users });
    } catch (error) {
        console.error(`Error in getAllUsers: ${error.message}`);
        return res.status(500).json({ message: `Error in getAllUsers: ${error.message}` });
    }
};

/*
@description: function to block a user
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

        if (!user) {
            throw new Error('User not found');
        }

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
/*
function to unblock a user and mark their cars as not deleted
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


/*
@description: function to make a user seller
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

/*
@description: function to update the user profile
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
                    city,
                    updatedAt: Date.now(),
                },
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
    } catch (err) {
        console.log(`Error in the updateUserProfileController: ${err.message}`);
        return res.status(500).json({ message: `Error in the updateUserProfileController: ${err.message}` });
    }
};

