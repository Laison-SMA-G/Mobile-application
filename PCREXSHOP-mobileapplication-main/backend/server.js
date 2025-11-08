// backend/server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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
export const API_URL = "https://pcrex-server.onrender.com";

// ✅ MongoDB Atlas connection
await connection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middleware setup

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" })); // for Base64 image upload
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Serve static files from /uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", chatRoutes);
app.use("/api/sales", salesRoutes);

// ✅ Server start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://192.168.100.45:${PORT}`);
  console.log(`✅ Static files served from /uploads`);
});
