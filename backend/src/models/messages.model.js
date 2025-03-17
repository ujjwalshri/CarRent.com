import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(  
    {
        conversation: {
            type: Object,
            required: true,
        },
        images: {
            type: Array,
        },
        message: {
            type: String,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;