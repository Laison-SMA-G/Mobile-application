// controllers/orderControllers.js
import Order from "../models/Order.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// Create new order (and log sale + decrease stock)
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

    // Verify products exist and update stock
    const checkedItems = await Promise.all(
      items.map(async (item) => {
        // item must include _id and quantity
        const product = await Product.findById(item._id);
        if (!product) throw new Error(`Product not found: ${item.name || item._id}`);
        if (product.stock < (item.quantity || 0))
          throw new Error(`Insufficient stock for ${product.name}`);

        // decrease stock
        product.stock -= item.quantity;
        await product.save();

        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          // ensure single image field exists (fallback to backend's placeholder path)
          image: product.image || "/uploads/placeholder.png",
        };
      })
    );

    // Create order record
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

    // Log sales:
    // - grouped sale (one document summarizing the order)
    // - individual item sales (one Sale per item) for analytics if desired
    try {
      // grouped sale entry
      await Sale.create({
        user: req.user._id,
        order: order._id,
        totalAmount: total,
        date: new Date(),
        items: checkedItems,
        cancelled: false,
      });

      // individual item sales
      await Promise.all(
        checkedItems.map((it) =>
          Sale.create({
            user: req.user._id,
            order: order._id,
            productId: it._id,
            quantity: it.quantity,
            amount: it.price * it.quantity,
            date: new Date(),
            cancelled: false,
          })
        )
      );
    } catch (saleErr) {
      // sale logging failure should not break order creation — log and continue
      console.error("Failed to log sale(s):", saleErr);
    }

    // Return consistent shape: { message, order }
    return res.status(201).json({ message: "Order placed successfully!", order });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return res.status(500).json({ error: err.message || "Failed to create order" });
  }
};

// Get all orders (admin)
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

// Get current user's orders
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

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Allow cancellation when order is still in To Ship or To Pay
    if (!["To Ship", "To Pay"].includes(order.status)) {
      return res.status(400).json({ error: "Order cannot be cancelled" });
    }

    // Check ownership (user cancelling own order)
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to cancel this order" });
    }

    order.status = "Cancelled";
    await order.save();

    // Restore product stock
    await Promise.all(
      order.items.map(async (it) => {
        const product = await Product.findById(it._id).exec();
        if (product) {
          product.stock += it.quantity;
          await product.save();
        }
      })
    );

    // Mark related sales as cancelled (soft-flag)
    await Sale.updateMany({ order: order._id }, { $set: { cancelled: true } });

    return res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("❌ Error cancelling order:", err);
    return res.status(500).json({ error: err.message || "Failed to cancel order" });
  }
};
