// server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Chat from "./models/Chat.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const server = http.createServer(app);

// -----------------
// CORS setup for localhost + mobile apps
// -----------------
const allowedOrigins = ["http://localhost:8081"];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow mobile apps / curl
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

// Preflight OPTIONS
app.options("*", cors());

// -----------------
// Socket.io with same CORS
// -----------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET","POST"],
    credentials: true
  }
});

// -----------------
// MongoDB connection
// -----------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err.message));

// -----------------
// ES Modules __dirname fix
// -----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Parse JSON
app.use(express.json());

// -----------------
// API routes
// -----------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/chats", chatRoutes);

// Example chat endpoint
app.get("/api/chats/:userId", async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId })
      .populate("participants", "name email")
      .lean();
    res.json(chats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------
// Socket.io realtime chat
// -----------------
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinChat", ({ chatId }) => {
    socket.join(chatId);
    console.log(`User joined chat ${chatId}`);
  });

  socket.on("sendMessage", async ({ chatId, text, senderId }) => {
    const newMsg = { sender: senderId, content: text, timestamp: new Date() };
    await Chat.findByIdAndUpdate(chatId, { $push: { messages: newMsg } });
    io.to(chatId).emit("message", { message: newMsg });
  });

  socket.on("disconnect", () => console.log("🔴 Socket disconnected"));
});

// -----------------
// Optional React web build
// -----------------
const buildPath = path.join(__dirname, "build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("🚀 Backend server is running!");
  });
}

// -----------------
// Listen
// -----------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on http://0.0.0.0:${PORT}`);
});
