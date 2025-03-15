import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    city:{
        type:String,
        required:true
    },
    isSeller:{
        type:Boolean,
        default:false
    },
    isAdmin: {
        type: Boolean,
        default: false,
    }
    }, {timestamps:true});


const User = mongoose.model('User', userSchema);

export default User;