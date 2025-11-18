// backend/routes/cartRoutes.js
import express from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    // ------- CART DB -------
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingItem = cart.items.find(i => i.productId.toString() === productId);
    if (existingItem) existingItem.quantity += quantity;
    else cart.items.push({ productId, quantity });

    await cart.save();

    // ------- USER DB -------
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userItem = user.cart.find(i => i.productId.toString() === productId);
    if (userItem) userItem.quantity += quantity;
    else user.cart.push({ productId, quantity });

    await user.save();

    res.json({ cart, user });

  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ message: "Server error adding to cart", error: error.message });
  }
});

// ✅ Get user cart
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    console.log("Fetching cart for userId:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const user = await User.findById(userId).populate("cart.productId");

    res.json({
      cart: cart || { items: [] },
      userCart: user ? user.cart : []
    });

  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Server error fetching cart", error: error.message });
  }
});

// ✅ Remove specific item
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid userId or productId" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();

    const user = await User.findById(userId);
    if (user) {
      user.cart = user.cart.filter(i => i.productId.toString() !== productId);
      await user.save();
    }

    res.json({ cart, user });

  } catch (error) {
    console.error("❌ Error removing item:", error);
    res.status(500).json({ message: "Server error removing item", error: error.message });
  }
});

// ✅ Clear cart
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    await Cart.findOneAndUpdate({ userId }, { items: [] });
    await User.findByIdAndUpdate(userId, { cart: [] });

    res.json({ message: "Cart cleared" });

  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ message: "Server error clearing cart", error: error.message });
  }
});

export default router;
