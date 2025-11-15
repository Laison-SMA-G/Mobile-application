import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    // For grouped sale logs
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now },

    items: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    // For individual item sale logs
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    amount: Number,

    // Allows cancellation tracking
    cancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
