import express from "express";
import { Server } from "socket.io";
import { createServer } from 'node:http';
import dotenv from "dotenv";
import connectMongoDB from "./config/db.connection.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";
import biddingRoutes from "./routes/bidding.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import messageRoutes from "./routes/message.routes.js";
import sellerAnalyticsRoutes from "./routes/seller.analytics.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import passport from "./config/passport.js"
import { startSQSBidProcessing } from "./config/SQS.js";
import cors from "cors";


const app = express(); // express app instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5500', // frontend url
      methods: ['GET', 'POST']
    }
  });



 // Store the Socket.IO instance in the app for use in controllers
 app.set('io', io);
 let onlineUsers = [];
 io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('userOnline', (username) => {
        if(!onlineUsers.includes(username)){
            onlineUsers.push(username);
            console.log(onlineUsers);
            console.log(`User ${username} is online`);
            
        }
        socket.emit('onlineUsers', onlineUsers);
    });

    socket.on('userOffline', (username) => {
        onlineUsers = onlineUsers.filter(user => user !== username);
        console.log(onlineUsers);
        socket.emit('onlineUsers', onlineUsers);
    });

    // Join a specific chat room
    socket.on('joinedConversation', (conversationId) => {
      
      socket.join(conversationId);
      console.log(`User joined chat: ${conversationId}`);
    });


    

    // // Handle disconnection
    // socket.on('disconnect', (conversationId) => {
    //   console.log(`User disconnected: ${conversationId}`);
    // });
  });

dotenv.config(); // to use the .env file
const PORT = process.env.PORT; // port number from .env file
app.use(express.json()); // middle ware to parse req.body 
app.use(express.urlencoded({extended : true})); //  to parse the form data in the req.body
app.use(cookieParser()); // to parse the cookies in the req.cookies



// CORS middleware
app.use(cors({
    origin: "http://localhost:5500", 
    credentials: true, 
  }));





app.use(passport.initialize()); // passport middleware
app.get('/test', (req, res) => {
    res.json({ message: 'API is running...' }); 
});

app.use('/api/auth' , authRoutes); 
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/bidding', biddingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/review', reviewRoutes)
app.use('/api/admin', adminAnalyticsRoutes)
app.use('/api/conversation', conversationRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/seller', sellerAnalyticsRoutes);


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
    startSQSBidProcessing();
});

