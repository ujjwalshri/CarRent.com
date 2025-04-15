import mongoose from "mongoose";

const addOnsSchema = new mongoose.Schema({
    owner: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        username: {
            type: String,
            required: true
        },
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false }
});

const AddOns = mongoose.model("AddOns", addOnsSchema);

export default AddOns;
