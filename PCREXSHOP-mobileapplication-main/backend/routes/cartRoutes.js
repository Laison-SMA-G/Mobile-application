import express from "express";
import Cart from "../models/Cart.js";

const router = express.Router();

// ✅ Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get user cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate(
      "items.productId"
    );
    res.json(cart || { items: [] });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Remove specific item
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("❌ Error removing item from cart:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Clear cart
router.delete("/:userId", async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.params.userId }, { items: [] });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
