import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const formattedProducts = products.map((p) => {
      // Main image
      let imageUrl = null;
      if (p.image) {
        if (p.image.startsWith("uploads/")) {
          imageUrl = `${baseUrl}/${p.image}`;
        } else if (p.image.startsWith("/uploads/")) {
          imageUrl = `${baseUrl}${p.image}`;
        } else if (p.image.startsWith("http")) {
          imageUrl = p.image;
        }
      }

      // Images array
      const imagesArray =
        Array.isArray(p.images) && p.images.length
          ? p.images.map((img) =>
              img.startsWith("http")
                ? img
                : `${baseUrl}/${img.replace(/^\/+/, "")}`
            )
          : imageUrl
          ? [imageUrl]
          : [];

      return {
        ...p,
        image: imageUrl,
        images: imagesArray,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};
