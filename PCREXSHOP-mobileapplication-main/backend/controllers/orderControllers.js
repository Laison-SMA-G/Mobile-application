import Order from "../models/Order.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// ✅ Create new order (and log sale + decrease stock)
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      shippingProvider,
      subtotal,
      shippingFee,
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No order items provided" });
    }

    // 🔍 Verify products exist and have valid IDs
    const checkedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item._id);
        if (!product) throw new Error(`Product not found: ${item.name}`);
        if (product.stock < item.quantity)
          throw new Error(`Insufficient stock for ${item.name}`);

        // Decrease stock
        product.stock -= item.quantity;
        await product.save();

        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.image || null,
        };
      })
    );

    // ✅ Create order record
    const order = await Order.create({
      user: req.user._id,
      items: checkedItems,
      shippingAddress,
      paymentMethod,
      shippingProvider,
      subtotal,
      shippingFee,
      total,
      status:
        paymentMethod === "COD" || paymentMethod === "GCASH"
          ? "To Ship"
          : "To Pay",
      orderDate: new Date(),
    });

    // ✅ Log sale
    await Sale.create({
      user: req.user._id,
      order: order._id,
      totalAmount: total,
      date: new Date(),
      items: checkedItems,
    });

    res.status(201).json({
      message: "Order placed successfully!",
      order,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
};

// ✅ Get all orders (for admin dashboard)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email")
      .sort({ orderDate: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ✅ Get current user's orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "fullName email")
      .sort({ orderDate: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
};
