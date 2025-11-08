import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
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
});

export default mongoose.model("Sale", saleSchema);
