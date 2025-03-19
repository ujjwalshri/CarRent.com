import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        vehicle: {
            _id:{
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            company: {
                type: String,
                required: true,
            },
            modelYear: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            color: {
                type: String,
                required: true,
            },
            mileage: {
                type: Number,
                required: true,
            },
        },
        reviewer: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            username: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            firstName: {
                type: String,
                required: true,
            },
            lastName: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            }
        },
        rating: {
            type: Number,
            required: true,
        },
        review: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;