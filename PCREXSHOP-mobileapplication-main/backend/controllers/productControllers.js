import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();

    const formattedProducts = products.map((p) => {
      let imageUrl = null;

      if (p.image) {
        // 1️⃣ Base64 stored in DB
        if (p.image.startsWith("data:image")) {
          imageUrl = p.image;
        }
        // 2️⃣ Relative path in uploads folder
        else if (p.image.startsWith("uploads/")) {
          imageUrl = `${req.protocol}://${req.get("host")}/${p.image}`;
        }
        // 3️⃣ Fallback (shouldn’t happen)
        else {
          imageUrl = null;
        }
      }

      return {
        _id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        quantity: p.quantity,
        image: imageUrl,
        images: p.images || [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    res.status(200).json(formattedProducts);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};
