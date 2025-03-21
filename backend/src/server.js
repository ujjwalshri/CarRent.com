import express from "express";
import dotenv from "dotenv";
import connectMongoDB from "./config/db.connection.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";
import biddingRoutes from "./routes/bidding.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import passport from "./config/passport.js"
import cors from "cors";


const app = express(); // express app instance
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



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});

