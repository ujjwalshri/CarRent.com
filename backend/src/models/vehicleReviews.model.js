import mongoose from "mongoose";

const vehicleReviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
    },
    reviewer: {
        type: Object,
        required: true,
    },
    vehicle: {
        type: Object,
        required: true,
    },
}, { timestamps: true });

const VehicleReview = mongoose.model('VehicleReview', vehicleReviewSchema);
export default VehicleReview;
