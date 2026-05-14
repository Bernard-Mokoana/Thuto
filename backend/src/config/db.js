import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed");
    console.error("Database error message: ", error);
  }
};

export default connectDB;
