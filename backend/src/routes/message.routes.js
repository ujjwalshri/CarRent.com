import express from 'express'; // import express
import protectRoute from '../middlewares/protectRoute.js';
import {addMessageController, getMessagesController, getAllAttachmentsController} from '../controllers/message.controller.js'; // import the addMessageController function from the message.controller.js file
import {uploadSingleImage} from '../middlewares/S3.middleware.js';


const router = express.Router(); // create a new router object

router.post('/addMessage/:conversationId', protectRoute, uploadSingleImage, addMessageController); // add the message
router.get('/getMessages/:conversationId', protectRoute, getMessagesController) // get the messages
router.get('/getAttachments/:conversationId', protectRoute, getAllAttachmentsController) // get the attachments
export default router; // export the router object