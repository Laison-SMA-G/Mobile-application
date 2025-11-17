import Product from "../models/Product.js";

// Utility to normalize URLs
const formatImageUrl = (baseUrl, img) => {
  if (!img || typeof img !== "string") return null;
  if (img.startsWith("http")) return img; // Already absolute
  return `${baseUrl}/${img.replace(/^\/+/, "").replace(/\\/g, "/")}`; // Normalize slashes
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();

    // Base URL for images
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const formattedProducts = products.map((p) => {
      // Single main image
      let mainImage = null;
      if (p.image) {
        mainImage = formatImageUrl(baseUrl, p.image);
      }

      // Images array
      const imagesArray =
        Array.isArray(p.images) && p.images.length
          ? p.images.map((img) => formatImageUrl(baseUrl, img))
          : mainImage
            ? [mainImage]
            : [];

      return {
        ...p,
        image: mainImage,
        images: imagesArray,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};
