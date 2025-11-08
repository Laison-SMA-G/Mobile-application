import mongoose from "mongoose";
import "dotenv/config";
export const API_URL = "https://pcrex-server.onrender.com";

const connection = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

export default connection;
