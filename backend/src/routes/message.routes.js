import express from 'express'; // import express
import protectRoute from '../middlewares/protectRoute.js';
import {addMessageController, getMessagesController} from '../controllers/message.controller.js'; // import the addMessageController function from the message.controller.js file
import { uploadchat } from '../config/s3.connection.js';
import upload from '../config/s3.connection.js';
const router = express.Router(); // create a new router object

router.post('/addMessage/:conversationId', protectRoute, uploadchat.single('image'),  addMessageController);
router.get('/getMessages/:conversationId', protectRoute, getMessagesController)


export default router; // export the router object