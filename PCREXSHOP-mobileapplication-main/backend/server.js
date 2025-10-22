// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // ✅ import CORS

import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"; 




dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*", credentials: true })); 
app.use(express.json()); // for parsing JSON requests

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes); // have orders


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
