import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
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
    location:{
        type:String,
        required:true
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
    fuelType: {
        type: String,
        required: true,
    },
    category:{
        type:String,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    city:{
        type:String,
        required:true
    },
    owner: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        }
    },
    vehicleImages: {
        type: Array,
        required: true,
    },
    registrationNumber:{
        type: String,
        required: true,
    }
}, {timestamps: true});


const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;