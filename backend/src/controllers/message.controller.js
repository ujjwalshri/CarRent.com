/**
 * Message Controllers
 * Handles all operations related to chat messages
 * @module controllers/message
 */

import Message from "../models/messages.model.js";
import Conversation from "../models/conversation.model.js";
import {emitToRoom} from "../services/socket.service.js";
import Attachment from "../models/chat.attachments.model.js";
/**
 * Adds a new message to a conversation
 * 
 * @async
 * @function addMessageController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.conversationId - ID of the conversation
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - Text content of the message
 * @param {Object} req.file - Uploaded image file (if any)
 * @param {Object} req.user - Authenticated user data
 * @param {string} req.user.username - Username of the sender
 * @param {string} req.user.firstName - First name of the sender
 * @param {string} req.user.lastName - Last name of the sender
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 * @description
 * Creates a new message in the specified conversation. Handles both text
 * and image messages. Updates the conversation's lastMessage field and
 * emits a socket event to notify participants of the new message.
 */
export const addMessageController = async(req,res)=>{
    const conversationId = req.params.conversationId;
    const {message} = req.body;
    try{

        const newMessage = new Message({
            conversationId: conversationId,
            sender: {
                _id: req.user._id,
                username: req.user.username,
            },
            message: message,
            image: {
                url: req.file?.location,
                key: req.file?.key,
                filename: req.file?.originalname,
                mimeType: req.file?.mimetype,
                size: req.file?.size,
            }

        });

        emitToRoom(conversationId, "newMessage", newMessage);
        await newMessage.save();

        if (req.file) {

            // Create an image object with file details and conversation ID
            const image = {
                url: req.file.location,
                key: req.file.key,
                filename: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                conversationId: conversationId,
                message : {
                    _id: newMessage._id,
                    sender: {
                        _id : req.user._id,
                        username: req.user.username,
                    },
                    messageContent: req.body.message || "Shared an attachment", // Provide default message if none is provided
                },
            };


            

            // Create a new attachment document and save it to the database
            const attachment = new Attachment(image);
            await attachment.save();
        }
        // update the conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {lastMessage: message});

        // emit a socket event to the client which will be the reciever of the message    
        
        return res.status(201).json({message: "Message sent successfully"});
    }catch(err){
        // rollback the image upload 
        if (req.file) {
            try {
                await s3Client.deleteObject({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: req.file.key
                }).promise();
                console.log('Image deleted from S3');
            } catch (cleanupError) {
                console.error('Failed to cleanup S3:', cleanupError);
            }
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                details: Object.values(err.errors).map(err => err.message)
            });
        }
        console.log(`Error adding message: ${err}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

/**
 * Retrieves all messages for a specific conversation
 * 
 * @async
 * @function getMessagesController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.conversationId - ID of the conversation
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with messages array or error
 * @description
 * Fetches all messages belonging to the specified conversation,
 * sorted in reverse chronological order (newest first).
 */
export const getMessagesController = async(req,res)=>{
    const conversationId = req.params.conversationId;
    try{
        const messages = await Message.find({ conversationId: conversationId }).sort({ createdAt: -1 });
        return res.status(200).json({messages});
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}

/**
 * function to get all attachments for a conversation
 * @param {*} req 
 * @param {*} res 
 * @returns {Object} JSON response with attachments array or error
 */
export const getAllAttachmentsController = async(req,res)=>{
    const conversationId = req.params.conversationId;
    try{
        const attachments = await Attachment.find({conversationId: conversationId});
        return res.status(200).json({attachments});
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}