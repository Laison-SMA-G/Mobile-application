// server/server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

import connection from "./config/connection.js";

// ✅ Import Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ MongoDB Atlas connection
await connection();

// Get directory path for static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware setup
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" })); // for Base64 image upload
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Serve static files from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", chatRoutes);
app.use("/api/sales", salesRoutes);

// ✅ Detect local network IP (for logging)
const networkInterfaces = os.networkInterfaces();
let localIP = "localhost";
for (const iface of Object.values(networkInterfaces)) {
  for (const alias of iface) {
    if (alias.family === "IPv4" && !alias.internal) {
      localIP = alias.address;
      break;
    }
  }
}

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://${localIP}:${PORT}`);
  console.log(`✅ Static files served from /uploads`);
});
