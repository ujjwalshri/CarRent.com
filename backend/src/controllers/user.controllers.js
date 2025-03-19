import User from "../models/user.model.js";

/*
@description:  function to get all the users from the database implemented filtering using the search query
*/
export const getAllUsers = async(req, res)=>{
    const {city} = req.query;
    try {
        const users = await User.find({city: city});
        if(!users){
            return res.status(404).json({message: 'No users found'});
        }
        return res.status(200).json({message: 'Users found', users});
    } catch (error) {
        console.log(`error in the getAllUsers ${error.message}`);
        res.status(500).json({message: `error in the getAllUsers ${error.message}`});
    }
}

/*
@description: function to block/unblock a user
*/
export const blockUnblockUser = async(req, res)=>{
    const {userId} = req.params;
    try {
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        user.isBlocked = !user.isBlocked;
        const savedUser = await user.save();
        if(!savedUser){
            return res.status(400).json({message: 'Error in blocking/unblocking the user'});
        }
        return res.status(200).json({message: 'User blocked/Unblocked successfully', user: savedUser});

    }catch(err){
        console.log(`error in the blockUserController ${err.message}`);
        res.status(500).json({message: `error in the blockUserController ${err.message}`});
    }
}