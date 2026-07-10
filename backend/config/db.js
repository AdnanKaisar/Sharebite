import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isMongoDB = false;

const connectDB = async () => {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully.');
      isMongoDB = true;
    } catch (error) {
      console.error('MongoDB connection failed. Falling back to local JSON database.', error.message);
      isMongoDB = false;
    }
  } else {
    console.log('No MONGO_URI provided. Running on local JSON file-based database.');
    isMongoDB = false;
  }
};

const getIsMongoDB = () => isMongoDB;

export { connectDB, getIsMongoDB as isMongoDB };
