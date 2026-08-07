import mongoose from "mongoose";
import dotenv from "dotenv";



const MONGODB_URI = process.env.MONGODB_URI!;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed");
  }
};

export default connectDB;
