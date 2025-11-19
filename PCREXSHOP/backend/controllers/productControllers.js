import Product from "../models/Product.js";
import path from "path";

// Helper: generate API URL for product images
const buildImageUrl = (req, imgPath) => {
  if (!imgPath) return null;

  // Extract file name from stored path
  const filename = path.basename(imgPath);

  // Base URL from environment variable or request
  const baseUrl = process.env.BASE_URL || `https://${req.get("host")}`;

  return `${baseUrl}  ${filename}`;
};

// -----------------------------  
// CREATE PRODUCT
// -----------------------------
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    // Save uploaded images paths
    const images = req.files
      ? req.files.map(file => `/uploads/products/${file.filename}`)
      : [];

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      category,
      images,
      image: images.length > 0 ? images[0] : null, // first image as main
    });

    const savedProduct = await newProduct.save();

    // Convert image paths to API URLs before sending to client
    const formattedImages = images.map(img => buildImageUrl(req, img));

    res.status(201).json({
      message: "Product created successfully",
      product: {
        ...savedProduct.toObject(),
        images: formattedImages,
        image: formattedImages.length > 0 ? formattedImages[0] : null,
      },
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ message: "Server error while creating product" });
  }
};

// -----------------------------
// GET ALL PRODUCTS
// -----------------------------
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();

    const formattedProducts = products.map((p) => {
      const imagesArray = Array.isArray(p.images) && p.images.length
        ? p.images.map(img => buildImageUrl(req, img))
        : [];

      return {
        ...p,
        images: imagesArray,
        image: imagesArray.length > 0 ? imagesArray[0] : null, // main image
      };
    });

    res.status(200).json(formattedProducts);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

// -----------------------------
// OPTIONAL: Get product by ID
// -----------------------------
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const imagesArray = Array.isArray(product.images) && product.images.length
      ? product.images.map(img => buildImageUrl(req, img))
      : [];

    res.status(200).json({
      ...product,
      images: imagesArray,
      image: imagesArray.length > 0 ? imagesArray[0] : null,
    });
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ message: "Server error while fetching product" });
  }
};


export const deleteProduct = async () => {
   try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: err.message });
  }
}
