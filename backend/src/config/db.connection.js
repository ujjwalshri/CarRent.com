import mongoose from 'mongoose';

const connectMongoDB =  async() =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`mongo db connected`);
    } catch (error) {
        console.log(`connections errror  ${error}`);
    }
}


export default connectMongoDB;