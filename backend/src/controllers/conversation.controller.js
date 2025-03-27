import Conversation from "../models/conversation.model.js";
import Vehicle from "../models/vehicle.model.js";


/* function to add a conversation to the database
@params req, res
@returns result message
*/
export const addConversationController = async(req,res)=>{
    const sender = {
        _id : req.user._id,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email
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
        console.log(vehicle);
        
        const conversation = new Conversation({
            sender,
            vehicle: vehicle,
            reciever: owner
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

/*
function to get all the conversations of the logged in user
@params req, res
@returns conversations
*/
export const getAllConversationsController = async(req, res)=>{
    const userId = req.user._id;
    console.log(userId);
    try{
        const conversations = await Conversation.find({$or: [{ 'sender._id': userId }, { 'reciever._id': userId }]});
        return res.status(200).json({conversations});
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}
/*
function to get all the conversations at a vehicle id
@params req, res
@returns conversations
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


