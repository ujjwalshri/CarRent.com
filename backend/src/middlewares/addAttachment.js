import Attachment from '../models/chat.Attachments.model.js';

export const addAttachment = async (req, res, next) => {
    const { conversationId } = req.params;
    console.log(req.file);
   try{
    if(req.file){
        const image = {
            url: req.file.location,
            key: req.file.key,
            filename: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            conversationId: conversationId
        };
        const attachment = new Attachment(image);
        await attachment.save();
        req.attachment = attachment;
    }
    next();
   }catch(error){
    console.log(error);
    return res.status(500).json({
        message: "Error adding attachment",
        error: error.message
    });
   }
}