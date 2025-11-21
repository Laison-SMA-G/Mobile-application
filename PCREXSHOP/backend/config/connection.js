// server/config/connection.js
import mongoose from "mongoose";
import "dotenv/config";

const production = false;
const URI = production ? process.env.MONGO_URI : process.env.MONGO_LOCAL_URI; // Loaded from .env or Render environment variables

const connection = async () => {
  try {
    if (!URI) throw new Error("MONGO_URI is not defined. Check your .env or Render env vars.");
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

export default connection;
