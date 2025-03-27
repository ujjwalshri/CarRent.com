import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        reciever:{
            _id: {
                type: mongoose.Schema.Types.ObjectId,
            },
            username:{
                type:String,
                required:[true, "Username is required"],
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
            },
        },
        lastMessage: {
           type: String,
           default: "",
        },
        sender:{
            _id:{
                type: mongoose.Schema.Types.ObjectId,
                required:true
            },
            username:{
                type:String,
                required:[true, "Username is required"],
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
            },
        },
        vehicle:{
            _id: {
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
            }
        },  
        },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
