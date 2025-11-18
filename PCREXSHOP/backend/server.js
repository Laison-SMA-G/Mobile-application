import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const server = http.createServer(app);

// ---------------------
// ES Modules paths
// ---------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------
// FIXED: CORS for mobile + desktop
// ---------------------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------------------
// Parse JSON requests
// ---------------------
app.use(express.json());

// ---------------------
// FIXED: Serve uploads publicly
// ---------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------
// API Routes
// ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes); // centralized products API
app.use("/api/cart", cartRoutes);
app.use("/api/chats", chatRoutes);

// ---------------------
// MongoDB Connection
// ---------------------
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ---------------------
// Start server on Render
// ---------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running at http://0.0.0.0:${PORT}`);
});
