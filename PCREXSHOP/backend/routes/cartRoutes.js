import express from "express";
import User from "../models/Cart.js";

const router = express.Router();

// ✅ Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // ------- CART DB -------
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const existingItem = cart.items.find(i => i.productId.toString() === productId);

    if (existingItem) existingItem.quantity += quantity;
    else cart.items.push({ productId, quantity });

    await cart.save();

    // ------- USER DB -------
    const user = await User.findById(userId);
    const userItem = user.cart.find(i => i.productId.toString() === productId);

    if (userItem) userItem.quantity += quantity;
    else user.cart.push({ productId, quantity });

    await user.save();

    res.json({ cart, user });

  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ message: error.message });
  }
});



// ✅ Get user cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate("items.productId");

    const user = await User.findById(req.params.userId)
      .populate("cart.productId");

    res.json({
      cart: cart || { items: [] },
      userCart: user ? user.cart : []
    });

  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: error.message });
  }
});



// ✅ Remove specific item
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // CART DB
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    await cart.save();

    // USER DB
    const user = await User.findById(userId);
    user.cart = user.cart.filter(i => i.productId.toString() !== productId);
    await user.save();

    res.json({ cart, user });

  } catch (error) {
    console.error("❌ Error removing item:", error);
    res.status(500).json({ message: error.message });
  }
});


// ✅ Clear cart
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // CART DB
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    // USER DB
    await User.findByIdAndUpdate(userId, { cart: [] });

    res.json({ message: "Cart cleared" });

  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ message: error.message });
  }
});


export default router;
