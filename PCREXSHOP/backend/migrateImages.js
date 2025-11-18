// migrateImages.js
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import "dotenv/config";
import Product from "./models/Product.js";

const MONGO_URI = process.env.MONGO_URI;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PRODUCTS_DIR = path.join(UPLOADS_DIR, "products");

async function main() {
  // 1️⃣ Connect to MongoDB
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("✅ Connected to MongoDB");

  // 2️⃣ Ensure /uploads/products exists
  if (!fs.existsSync(PRODUCTS_DIR)) {
    fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
    console.log("✅ Created uploads/products folder");
  }

  // 3️⃣ Get all products
  const products = await Product.find();
  console.log(`Found ${products.length} products`);

  for (let product of products) {
    let updatedImages = [];

    for (let img of product.images) {
      const oldPath = path.join(UPLOADS_DIR, img);
      const newPath = path.join(PRODUCTS_DIR, path.basename(img));

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath); // move file
        console.log(`✅ Moved ${img} → products/${path.basename(img)}`);
      }

      // Save relative path for DB
      updatedImages.push(`products/${path.basename(img)}`);
    }

    product.images = updatedImages;
    await product.save();
  }

  console.log("✅ All product image paths updated in DB");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
