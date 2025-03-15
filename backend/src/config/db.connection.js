import mongoose from 'mongoose';

const connectMongoDB =  async() =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`mongo db connected ${conn.connection.host}`);
    } catch (error) {
        console.log(`connections errror  ${error}`);
        process.exit(1);
    }
}


export default connectMongoDB;