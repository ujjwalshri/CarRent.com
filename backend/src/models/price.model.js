    import mongoose from "mongoose";

    const priceSchema = new mongoose.Schema({
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    });

    const Price = mongoose.model("Price", priceSchema);
    export default Price;
