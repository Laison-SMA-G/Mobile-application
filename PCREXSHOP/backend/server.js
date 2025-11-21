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
import addressRoutes from "./routes/addressRoutes.js";

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
// Serve uploads folder publicly (optional fallback)
// ---------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------
// Serve product images through API
// ---------------------
app.get("/api/products/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads/products", filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("❌ Error sending file:", err);
      res.status(404).send("Image not found");
    }
  });
});

// ---------------------
// API Routes
// ---------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes); // centralized products API
app.use("/api/cart", cartRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users/:userId/addresses", addressRoutes);

// ---------------------
// MongoDB Connection
// ---------------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ---------------------
// Start server on Render
// ---------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port http://localhost:${PORT}`);
});
