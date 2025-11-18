// controllers/productController.js
import Product from "../models/Product.js";

// Helper to build full image URL
const buildImageUrl = (req, imgPath) => {
  if (!imgPath) return null;
  // Already absolute
  if (imgPath.startsWith("http")) return imgPath;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}${imgPath.replace(/\\/g, "/")}`; // ensure forward slashes
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    // Save uploaded images paths
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

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

    res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ message: "Server error while creating product" });
  }
};

// GET ALL PRODUCTS
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
