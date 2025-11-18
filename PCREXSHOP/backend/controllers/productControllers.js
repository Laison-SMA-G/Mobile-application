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

// GET ALL PRODUCTS (centralized for mobile)
export const getAllProducts = async (req, res) => {
  try {
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    // Search & filter
    const search = req.query.search || "";
    const category = req.query.category || "";

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (category && category !== "All") query.category = category;

    // Fetch products from DB with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Build absolute image URLs
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const formattedProducts = products.map((p) => {
      const imagesArray = Array.isArray(p.images) && p.images.length
        ? p.images.map(img => img.startsWith("http") ? img : `${baseUrl}${img.replace(/\\/g, "/")}`)
        : [];

      return {
        ...p,
        images: imagesArray,
        image: imagesArray.length > 0 ? imagesArray[0] : null, // main image
      };
    });

    res.status(200).json({
      page,
      limit,
      count: formattedProducts.length,
      products: formattedProducts,
    });

  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};
