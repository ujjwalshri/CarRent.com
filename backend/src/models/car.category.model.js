import mongoose from "mongoose";

const carCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
}, { timestamps: true });

const CarCategory = mongoose.model("CarCategory", carCategorySchema);

export default CarCategory;
