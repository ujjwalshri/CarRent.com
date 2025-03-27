import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true, "Username is required"],
        unique:true
    },
    password:{
        type:String,
        required:[true, "Password is required"],
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
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
    },
    adhaar:{
        type:String,
        required:[ true, "Adhaar is required"],
        unique:true
    }
    }, {timestamps:true});


const User = mongoose.model('User', userSchema);

export default User;