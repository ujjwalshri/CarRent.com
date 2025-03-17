import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: {
            type: Array,
        },
        reciever:{
            type:String
        },
        sender:{
            type:String
        },
        car:{
            type:Object
        },  
        },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
