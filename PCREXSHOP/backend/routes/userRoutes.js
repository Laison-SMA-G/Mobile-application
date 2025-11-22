import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Order from "../models/Order.js"; // ✅ to fetch customer orders
import auth from "../middlewares/auth.js";



const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";
const JWT_EXPIRES_IN = "7d";

/* ==============================
   🔹 AUTH ROUTES (Register, Login)
   ============================== */

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(403).json({ message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashed });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        profileImage: newUser.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// Get current user (for logged-in users)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user info" });
  }
});

/* ==============================
   🔹 PASSWORD RESET ROUTES
   ============================== */

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account with that email." });

    const buffer = crypto.randomBytes(20);
    const token = buffer.toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "your_smtp_user",
        pass: process.env.SMTP_PASS || "your_smtp_pass",
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:19006"}/reset-password/${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM || "no-reply@example.com",
      subject: "Password Reset Request",
      text: `You requested a password reset. Visit: ${resetLink}\nThis link is valid for 1 hour.`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error("Mail error:", err);
        return res.json({ message: "Could not send email. Use the link below (dev only).", resetLink });
      }
      res.json({ message: "Email sent." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password required." });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

/* ==============================
   🔹 ADMIN & PROFILE ROUTES
   ============================== */

// Protect routes
router.use(auth);

// ✅ Get all users (for admin Customers page)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("fullName email phone profileImage");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ✅ Get single user with their order details
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("fullName email phone address profileImage");
    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.find({ user: userId }).sort({ orderDate: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const ordersByStatus = {};
    orders.forEach((order) => {
      if (!ordersByStatus[order.status]) ordersByStatus[order.status] = [];
      ordersByStatus[order.status].push(order);
    });

    res.json({
      ...user.toObject(),
      totalOrders,
      totalSpent,
      ordersByStatus,
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
});


export default router;
