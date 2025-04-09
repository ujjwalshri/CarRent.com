import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(  
    {
        conversation: {
            type: Object,
            required: true,
        },
        image: {
            type: Object,
        },
        message: {
            type: String,
        },
        sender:{
            username:{
                type:String,
                required:[true, "Username is required"],
            }
        }
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;