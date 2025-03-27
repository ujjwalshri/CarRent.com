import express from 'express'; // import express

import protectRoute from "../middlewares/protectRoute.js"; // import the protectRoute middleware
import {addConversationController, getAllConversationsAtCarIdController, getAllConversationsController} from '../controllers/conversation.controller.js'; // import the addConversationController function from the conversation.controller.js file

const router = express.Router(); // create a new router object

router.post('/addConversation/:vehicleId', protectRoute, addConversationController); // route to add a conversation
router.get('/getAllConversations', protectRoute, getAllConversationsController); // route to get all conversations
router.get('/getConversatons/vehicle/:id', protectRoute, getAllConversationsAtCarIdController); // route to get all conversations at vehicle id

export default router; // export the router object