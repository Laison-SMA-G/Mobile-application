import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },

});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: categorySchema,
    quantity: { type: Number, default: 0 },

    image: String,
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
