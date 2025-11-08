import User from "../models/User.js";
import Order from "../models/Order.js";
import multer from "multer";
import path from "path";

// ✅ Multer setup (profile image upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profiles"); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
export const upload = multer({ storage });

// ✅ Get all users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "fullName email phone profileImage createdAt");
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ getAllUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// ✅ Get single user details with order info
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId, "fullName email phone address profileImage");
    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.find({ user: userId });

    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;

    // Group orders by status
    const ordersByStatus = {};
    orders.forEach((order) => {
      const status = order.status || "Unknown";
      if (!ordersByStatus[status]) ordersByStatus[status] = [];
      ordersByStatus[status].push(order);
    });

    res.status(200).json({
      ...user.toObject(),
      totalSpent,
      totalOrders,
      ordersByStatus,
    });
  } catch (error) {
    console.error("❌ getUserDetails error:", error);
    res.status(500).json({ message: "Failed to load user details", error: error.message });
  }
};

// ✅ Update user profile (for customers)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // comes from auth middleware
    const { fullName, email, phone, address } = req.body;
    const updateData = { fullName, email, phone, address };

    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ updateUserProfile error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};
