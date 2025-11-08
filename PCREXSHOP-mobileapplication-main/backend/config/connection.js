import mongoose from "mongoose";
import "dotenv/config";
const URI = process.env.MONGO_URI;

const connection = async () => {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

export default connection;
