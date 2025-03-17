import mongoose from "mongoose";

const biddingSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    from:{
        type: Object,
        required: true,
    },
    location:{
        type:String,
        required:true
    }, 
    vehicle:{
        type: Object,
        required: true,
    },
    owner:{
        type:Object,
        required:true
    },
    status:{
        type:String,
        default:"pending"
    }
}, {timestamps:true});

const Bidding = mongoose.model('Bidding', biddingSchema);
export default Bidding;
