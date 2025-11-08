import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
      },
    ],
    shippingAddress: {
      fullName: String,
      phoneNumber: String,
      addressLine1: String,
      city: String,
      postalCode: String,
      country: String,
      name: String,
    },
    paymentMethod: { type: String, required: true },
    shippingProvider: {
      id: String,
      name: String,
      estimatedDays: String,
      fee: Number,
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: "To Pay" },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
