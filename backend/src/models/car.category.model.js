import mongoose from "mongoose";

const carCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "categories",  
  }
);

export default mongoose.model("CarCategory", carCategorySchema);
