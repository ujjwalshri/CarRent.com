/**
 * Conversation Controllers
 * Handles all operations related to chat conversations
 * @module controllers/conversation
 */
import Conversation from "../models/conversation.model.js";
import Vehicle from "../models/vehicle.model.js";

/**
 * Creates a new conversation or returns an existing one
 * 
 * @async
 * @function addConversationController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.vehicleId - ID of the vehicle being discussed
 * @param {Object} req.body - Request body containing receiver information
 * @param {Object} req.user - Authenticated user data (sender)
 * @param {string} req.user._id - User ID of the sender
 * @param {string} req.user.username - Username of the sender
 * @param {string} req.user.firstName - First name of the sender
 * @param {string} req.user.lastName - Last name of the sender
 * @param {string} req.user.email - Email of the sender
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with conversation data or error
 * @description
 * Creates a new conversation between a sender (current user) and a receiver (vehicle owner)
 * about a specific vehicle. Checks if a conversation already exists before creating
 * a new one. Emits a socket event to notify participants of the new conversation.
 */
export const addConversationController = async(req,res)=>{
    const sender = {
        _id : req.user._id,
        username: req.user.username,
    };

    const vehicleId = req.params.vehicleId;
    const owner = req.body;
    console.log(owner);

    try{
        // check for existing conversation if there is an existing conversation on that vehicle ID between the sender and the owner then return the conversation
        const existingConversation = await Conversation.findOne({
            $and: [
                { 'sender._id': sender._id },
                { 'reciever._id': owner._id },
                { 'vehicle._id': vehicleId }
            ]
        })
        if(existingConversation){
            return res.status(200).json({existingConversation});
        }

        const vehicle = await Vehicle.findById(vehicleId).select('_id name company modelYear location');

        
        const conversation = new Conversation({
            sender,
            vehicle: vehicle,
            reciever: {
                _id: owner._id,
                username: owner.username,
            }
        });

        
        await conversation.save();
        // throw an event that a new conversation has been created if the user is online and connected i want to send the newConversation event to the client
        const io = req.app.get('io');
        io.emit('newConversation', conversation);
        return res.status(201).json({conversation});
    }catch(err){
        console.log(`Error adding conversation: ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

/**
 * Retrieves all conversations for the logged-in user
 * 
 * @async
 * @function getAllConversationsController
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user data
 * @param {string} req.user._id - User ID of the logged-in user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with conversations array or error
 * @description
 * Fetches all conversations where the logged-in user is either
 * the sender or receiver of the conversation.
 */
export const getAllConversationsController = async(req, res)=>{
    const userId = req.user._id;
    try{
        const conversations = await Conversation.find({$or: [{ 'sender._id': userId }, { 'reciever._id': userId }]});
        return res.status(200).json({conversations});
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}

/**
 * Retrieves all conversations related to a specific vehicle for the logged-in user
 * 
 * @async
 * @function getAllConversationsAtCarIdController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Vehicle ID to filter conversations by
 * @param {Object} req.user - Authenticated user data
 * @param {string} req.user._id - User ID of the logged-in user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with conversations array or error
 * @description
 * Fetches all conversations where the logged-in user is either the sender or receiver
 * and that are related to a specific vehicle, sorted by most recently updated first.
 */
export const getAllConversationsAtCarIdController = async(req, res)=>{ 
    const vehicleId = req.params.id;
    try{
        // finding all the conversations where the sender or reciever is the logged in user and the vehicle id is the vehicle id passed in the url
        const conversations = await Conversation.find({
            $and: [
                { $or: [
                    { 'sender._id': req.user._id },
                    { 'reciever._id': req.user._id }
                ] },
                { 'vehicle._id': vehicleId }
            ]
        }).sort({ updatedAt: -1 });
        return res.status(200).json({conversations});
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}


