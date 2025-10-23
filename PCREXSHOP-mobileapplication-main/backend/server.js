import express from "express";
import "dotenv/config";
import cors from "cors";
import connection from "./config/connection.js"; // mongodb connection
const app = express(); // express app instance
const PORT = process.env.PORT || 5000; // server port

// routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// MongoDB connection
await connection();

//  Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json()); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
