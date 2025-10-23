import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import auth from "../middlewares/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key";
const JWT_EXPIRES_IN = "7d";

// register
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

    // Issue token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log(token);
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

// login
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

// get current user
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No account with that email." });

    // Create reset token
    const buffer = crypto.randomBytes(20);
    const token = buffer.toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Setup nodemailer transporter — configure with real credentials or use a dev transporter
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
      text: `You requested a password reset. Click or visit: ${resetLink}\nThis link is valid for 1 hour.`,
    };

    // Send mail (in dev, you may prefer to return resetLink instead of sending email)
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Mail error:", err);
        // For dev fallback, return the reset link in response (unsafe for prod)
        return res.json({ message: "Could not send email. Use the link below (dev only).", resetLink });
      }
      res.json({ message: "Email sent." });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// reset password
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

export default router;
