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
            city: {
                type: String,
                required: true,
            }
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
            city: {
                type: String,
                required: true,
            }
        },
        owner:{
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            username: {
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
            default: "", // Adding a default empty string
            required: false // Explicitly making it not required
        },
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;