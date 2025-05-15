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
            }
        },
        lastMessage: {
           type: String,
           default: "",
        },
        creator:{
            _id:{
                type: mongoose.Schema.Types.ObjectId,
                required:true
            },
            username:{
                type:String,
                required:[true, "Username is required"],
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
            },
            image: {
                type: Object,
                required: true,
            },
            fuelType :{
                type: String,
                required: true,
            },
            category:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            }
        },  
        },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
