/**
 * Review Controllers Module
 * 
 * This module handles all review-related operations for the car rental platform,
 * including retrieving reviews for vehicles and adding new reviews.
 * It manages transactions to ensure data consistency between Reviews and Biddings.
 * 
 * @module controllers/review.controllers
 */

import mongoose from "mongoose";
import Bidding from "../models/bidding.model.js";
import Review from "../models/review.model.js";
import Vehicle from "../models/vehicle.model.js";


/**
 * Get All Reviews For A Specific Vehicle
 * 
 * Retrieves all reviews for a particular vehicle by its ID, with pagination
 * support and calculation of average rating.
 * 
 * @async
 * @function getAllReviewsAtCarIdController
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Vehicle ID to get reviews for
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.skip=0] - Number of reviews to skip (for pagination)
 * @param {number} [req.query.limit=1] - Maximum number of reviews to return
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with reviews and average rating
 */
export const getAllReviewsAtCarIdController = async (req, res) => {
    const { id } = req.params;
    const { skip = 0, limit = 1 } = req.query;
    console.log(req.query);

    try {
        // Fetch reviews for the specified vehicle with pagination
        const reviews = await Review.find({ 'vehicle._id': id })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        // Calculate average rating using aggregation pipeline
        const avgRatingResult = await Review.aggregate([
            {
                // Match reviews for the specific vehicle
                // Validate ObjectId to prevent errors with invalid IDs
                $match: { 'vehicle._id': mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
            },
            {
                // Group all matches and calculate average rating
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);
            
        // Handle cases where no reviews are found
        const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

        // Return reviews and average rating
        return res.status(200).json({
            reviews,
            avgRating
        });
    } catch (err) {
        // Log and return error
        console.error(`Error in getAllReviewsAtCarIdController: ${err.message}`);
        res.status(500).json({ error: `Error in getAllReviewsAtCarIdController: ${err.message}` });
    }
};


/**
 * Add a New Review
 * 
 * Creates a new review for a vehicle and updates the associated booking status to "reviewed".
 * Uses a database transaction to ensure that both operations succeed or fail together.
 * 
 * @async
 * @function addReviewController
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.bookingId - ID of the booking being reviewed
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - Vehicle ID being reviewed
 * @param {Object} req.body - Request body
 * @param {number} req.body.rating - Rating value (1-5)
 * @param {string} req.body.review - Review text content
 * @param {Object} req.user - Authenticated user information
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating success or error
 */
export const addReviewController = async (req, res) => { 
    console.log(req.query);
    const { bookingId } = req.query;
    const { id } = req.params;
    const { rating, review } = req.body;

    // Input validation for review and rating 
    if (!rating || !review) {
        return res.status(400).json({ error: 'Rating and review are required' });
    }
    if(rating < 1 || rating > 5){
        return res.status(400).json({ error: 'Rating should be between 1 and 5' });
    }
    if(review.length > 10000){
        return res.status(400).json({ error: 'Review should be atleast 10 characters long' });
    }
    
    // Start a database transaction to ensure data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Extract reviewer information from authenticated user
        const { _id, username, email, firstName, lastName, city } = req.user; 
        const reviewer = { _id, username, email, firstName, lastName, city }; 
        
        // Find the vehicle being reviewed
        const vehicle = await Vehicle.findById(id).session(session);

        if (!vehicle) {
            throw new Error('Vehicle not found');
        }

        // Create new review document
        const reviewData = new Review({ 
            rating,
            review,
            vehicle,
            reviewer
        });

        // Save the review to the database within the transaction
        await reviewData.save({ session });

        // Update the booking status to "reviewed"
        const bookingUpdate = await Bidding.findByIdAndUpdate(
            bookingId, 
            { status: "reviewed" }, 
            { new: true, session }
        );
       
        // Validate that the booking exists
        if (!bookingUpdate) {
            throw new Error('Booking not found');
        }

        console.log("bookingStatus changed");

        // Commit the transaction if both operations succeed
        await session.commitTransaction();
        session.endSession();
        
        // Verify the updated booking (for debugging)
        const booking = await Bidding.findById(bookingId);
        console.log(booking);

        // Return success response
        return res.status(201).json({ message: 'Review added successfully' }); 
    } catch (err) {
        // Abort the transaction if any operation fails
        await session.abortTransaction();
        session.endSession();

        // Log and return error
        console.log(`Error in the addReviewController: ${err.message}`);
        return res.status(500).json({ error: `Error in the addReviewController: ${err.message}` });
    }
};
