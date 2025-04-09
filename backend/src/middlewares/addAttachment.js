import Attachment from '../models/chat.Attachments.model.js';

/**
 * @function addAttachment
 * @description Middleware to handle adding an attachment to a conversation.
 * It processes the uploaded file, saves it as an attachment in the database, 
 * and attaches the saved attachment to the request object.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Parameters from the request URL.
 * @param {string} req.params.conversationId - ID of the conversation to which the attachment belongs.
 * @param {Object} req.file - Uploaded file object provided by middleware like multer.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const addAttachment = async (req, res, next) => {
    const { conversationId } = req.params;
    try {
        if (req.file) {
            // Create an image object with file details and conversation ID
            const image = {
                url: req.file.location,
                key: req.file.key,
                filename: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                conversationId: conversationId
            };

            // Create a new attachment document and save it to the database
            const attachment = new Attachment(image);
            await attachment.save();

            // Attach the saved attachment to the request object
            req.attachment = attachment;
        }
        next();
    } catch (error) {
        console.log(error);

        // Handle errors and send a 500 response with an error message
        return res.status(500).json({
            message: "Error adding attachment",
            error: error.message
        });
    }
};