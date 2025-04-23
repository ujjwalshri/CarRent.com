import mongoose from "mongoose";

const chargesSchema = new mongoose.Schema({
    name :{
        type: String,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const Charges = mongoose.model('Charges', chargesSchema);
export default Charges;


