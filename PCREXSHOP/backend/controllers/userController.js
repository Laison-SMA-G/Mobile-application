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


// ✅ Add new address
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAddress = { ...req.body, _id: new mongoose.Types.ObjectId() };

    // If the new address is default, unset all others
    if (newAddress.isDefault) {
      user.address.forEach(addr => (addr.isDefault = false));
    }

    user.address.push(newAddress);
    await user.save();

    res.status(201).json(newAddress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add address", error: err.message });
  }
};

// ✅ Update existing address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const index = user.address.findIndex(a => a._id.toString() === addressId);
    if (index === -1) return res.status(404).json({ message: "Address not found" });

    // If updating to default, unset all others
    if (req.body.isDefault) {
      user.address.forEach(addr => (addr.isDefault = false));
    }

    user.address[index] = { ...user.address[index]._doc, ...req.body };
    await user.save();

    res.status(200).json(user.address[index]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update address", error: err.message });
  }
};

// ✅ Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address = user.address.filter(addr => addr._id.toString() !== addressId);
    await user.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete address", error: err.message });
  }
};

// ✅ Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.address.forEach(addr => (addr.isDefault = addr._id.toString() === addressId));
    await user.save();

    const defaultAddress = user.address.find(addr => addr.isDefault);
    res.status(200).json(defaultAddress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to set default address", error: err.message });
  }
};
