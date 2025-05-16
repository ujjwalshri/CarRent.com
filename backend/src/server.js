/**
 * Car Rental Application Server
 * 
 * This is the main server file for the Car Rental application.
 * It configures Express, Socket.IO for real-time communication, 
 * connects to MongoDB, sets up middleware, and defines API routes.
 * 
 * The application uses an MVC architecture with:
 * - Routes: API endpoints definitions
 * - Controllers: Business logic handlers
 * - Models: Data schemas and database interactions
 */

import express from "express";
import { createServer } from 'node:http';
import dotenv from "dotenv";
import connectMongoDB from "./config/db.connection.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminAnalyticsRoutes from "./routes/admin.routes.js";
import biddingRoutes from "./routes/bidding.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import messageRoutes from "./routes/message.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import addonRoutes from "./routes/addon.routes.js";
import taxesRoutes from "./routes/taxes.routes.js";
import recommedationRoutes from "./routes/recommendation.routes.js";
import geminiRoutes from "./routes/gemini.routes.js";

import passport from "./config/passport.js"
import cors from "cors";
import { initializeSocket, emitBidSuccess } from './services/socket.service.js';

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize Express application and create HTTP server
 */
const app = express();
const server = createServer(app);

/**
 * Initialize Socket.IO with the HTTP server
 * Make the Socket.IO instance available throughout the application
 */
const io = initializeSocket(server);
app.set('io', io);

/**
 * Load environment variables from .env file
 * Set up the port for the server to listen on
 */
dotenv.config();
const PORT = process.env.PORT;

/**
 * Configure Express middleware
 * - express.json(): Parses JSON request bodies
 * - express.urlencoded(): Parses URL-encoded form data
 * - cookieParser(): Parses cookies in requests
 */
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

/**
 * Configure Cross-Origin Resource Sharing (CORS)
 * Enables secure communication between frontend and backend
 * across different domains/ports
 */
app.use(cors({
    origin: process.env.ISPRODUCTION ? 'https://car-rent-com.vercel.app'  :["http://localhost:5500"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

/**
 * Initialize Passport.js for authentication
 */
app.use(passport.initialize());

/**
 * API test endpoint
 * Used to verify API is running correctly
 */
app.get('/test', (req, res) => {
    res.json({ message: 'API is running...' }); 
});

/**
 * API Routes Configuration
 * Each route file handles a specific domain of functionality
 */
app.use('/api/auth', authRoutes);           // Authentication endpoints
app.use('/api/vehicle', vehicleRoutes);     // Vehicle management endpoints
app.use('/api/bidding', biddingRoutes);     // Bidding and booking functionality
app.use('/api/user', userRoutes);           // User profile management
app.use('/api/review', reviewRoutes);       // Vehicle and booking reviews
app.use('/api/admin', adminAnalyticsRoutes); // Admin dashboard and analytics
app.use('/api/conversation', conversationRoutes); // Messaging conversations
app.use('/api/message', messageRoutes);     // Individual messages
app.use('/api/seller', sellerRoutes); // Seller analytics and dashboard
app.use('/api/addon', addonRoutes);  // Add-ons functionality
app.use('/api/taxes', taxesRoutes);  // Taxes management
app.use('/api/recommendation', recommedationRoutes); // Vehicle recommendations
app.use('/api/gemini', geminiRoutes); // Gemini AI integration for review analysis

/**
 * Initialize SQS Worker Thread
 * Starts a worker thread to process SQS messages in parallel
 */
function startSQSWorker() {
    const workerPath = join(__dirname, 'workers', 'bidding.worker.js');
    const worker = new Worker(workerPath);

    worker.on('message', (message) => {
        // Handle bid success messages from worker
        if (message.type === 'bidSuccess') {
            const { username, bidData } = message.data;
            emitBidSuccess(username, bidData);
        } else if (message.status === 'success') {
            console.log(`Successfully processed message: ${message.messageId}`);
        } else {
            console.error(`Error processing message ${message.messageId}:`, message.error);
        }
    });

    worker.on('error', (error) => {
        console.error('Worker error:', error);
        // Restart worker on error
        setTimeout(startSQSWorker, 5000);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
            // Restart worker on abnormal exit
            setTimeout(startSQSWorker, 5000);
        }
    });
}

/**
 * Start the server
 * 1. Listen on specified port
 * 2. Connect to MongoDB database
 * 3. Start SQS worker thread for processing bids
 */
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
    startSQSWorker();
});

