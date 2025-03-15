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
    model: {
        type: String,
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
    year: {
        type: Number,
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
        default: "pending",
    },
    city:{
        type:String,
        required:true
    },
    Owner:{
        type: Object,
        required: true,
    },
    mileage:{
        type:Number,
        required:true
    },
    vehicleImages : {
        type: Array,
        required: true,
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;