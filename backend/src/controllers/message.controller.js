import Message from "../models/messages.model.js";
import Conversation from "../models/conversation.model.js";

/*
function to add a message to the database
@params req, res
@returns result message
*/
export const addMessageController = async(req,res)=>{
    const conversationId = req.params.conversationId;
    const {message} = req.body;
    console.log(req.body);

   
    let image;
    console.log("req ki files" ,req.file);
    if(req.file){
         image = {
            url: req.file.location,
            key: req.file.key,
            name: req.file.originalname,
            uploadedAt: new Date()
        };
    }
    console.log(image);

    try{
        const newMessage = new Message({
            conversation: conversationId,
            sender: {
                username: req.user.username,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
            },
            message: message,
            image:image? image : null,
        });
    
        await newMessage.save();
        // update the conversation last message
    
        await Conversation.findByIdAndUpdate(conversationId, {lastMessage: message});

        // emit a socket event to the client which will be the reciever of the message    
        const io = req.app.get('io'); 
        io.to(conversationId).emit('newMessage', newMessage);

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
/*
function to get all the messages of a conversation
@params req, res
@returns messages
*/
export const getMessagesController = async(req,res)=>{
    const conversationId = req.params.conversationId;
    try{
        const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: -1 });
        return res.status(200).json({messages});
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}