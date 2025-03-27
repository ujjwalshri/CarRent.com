import mongoose from "mongoose";
import Bidding from "../models/bidding.model.js";
import Review from "../models/review.model.js";
import Vehicle from "../models/vehicle.model.js";


/*
    @description function to get all the reviews at a particular carId
*/
export const getAllReviewsAtCarIdController = async (req, res) => {
    const { id } = req.params;
    const { skip = 0, limit = 1 } = req.query;
    console.log(req.query);

    try {
      

        const reviews = await Review.find({ 'vehicle._id': id })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

            const avgRatingResult = await Review.aggregate([
                {
                    $match: { 'vehicle._id': mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
                },
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: '$rating' }
                    }
                }
            ]);
            
            // Handle cases where no reviews are found
            const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

        return res.status(200).json({
            reviews,
            avgRating
        });
    } catch (err) {
        console.error(`Error in getAllReviewsAtCarIdController: ${err.message}`);
        res.status(500).json({ error: `Error in getAllReviewsAtCarIdController: ${err.message}` });
    }
};


/*
    @description function to Add a review to the database
*/
export const addReviewController = async (req, res) => { 
    console.log(req.query);
    const { bookingId } = req.query;
    const { id } = req.params;
    const { rating, review } = req.body;

    // validations for review and rating 
    if (!rating || !review) {
        return res.status(400).json({ error: 'Rating and review are required' });
    }
    if(rating < 1 || rating > 5){
        return res.status(400).json({ error: 'Rating should be between 1 and 5' });
    }
    if(review.length > 10000){
        return res.status(400).json({ error: 'Review should be atleast 10 characters long' });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { _id, username, email, firstName, lastName, city } = req.user; 
        const reviewer = { _id, username, email, firstName, lastName, city }; 
        const vehicle = await Vehicle.findById(id).session(session);

        if (!vehicle) {
            throw new Error('Vehicle not found');
        }

        const reviewData = new Review({ 
            rating,
            review,
            vehicle,
            reviewer
        });

        await reviewData.save({ session });


        const bookingUpdate = await Bidding.findByIdAndUpdate(
            bookingId, 
            { status: "reviewed" }, 
            { new: true, session }
        );
       
        

        if (!bookingUpdate) {
            throw new Error('Booking not found');
        }

        console.log("bookingStatus changed");

        await session.commitTransaction();
        session.endSession();
        const booking = await Bidding.findById(bookingId);
        console.log(booking);

        return res.status(201).json({ message: 'Review added successfully' }); 
    } catch (err) {

        await session.abortTransaction();
        session.endSession();

        console.log(`Error in the addReviewController: ${err.message}`);
        return res.status(500).json({ error: `Error in the addReviewController: ${err.message}` });
    }
};
