import mongoose from 'mongoose';

const taxSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  value: {
    type: Number,
    required: true,  
  },
  isActive: {
    type: Boolean,
    default: true,
  },
 
},{timestamps: true});

const Tax = mongoose.model('Tax', taxSchema);
export default Tax;
