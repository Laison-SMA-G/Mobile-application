// utils/api.js
const PROD_BASE_URL = "https://mobile-application-2.onrender.com/api";

import { getImageSource, fetchProducts } from "../utils/api";

const fetchAndFormatProducts = async () => {
  try {
    const data = await fetchProducts(); // returns array of products with Cloudinary URLs

    const formatted = data.map((item) => {
      const quantity = typeof item.quantity === "number" ? item.quantity : 0;

      // Use Cloudinary URLs directly
      const images =
        Array.isArray(item.images) && item.images.length
          ? item.images
          : ["https://via.placeholder.com/150"]; // fallback image

      return {
        ...item,
        quantity,
        images,
        image: images[0], // main thumbnail
      };
    });

    setAllProducts(formatted);
    setFilteredProducts(formatted);

    const uniqueCategories = [
      ...new Set(formatted.map((i) => i.category || "Unknown")),
    ];
    setCategories(uniqueCategories);
  } catch (error) {
    console.error("❌ Failed to fetch products:", error.message || error);
  }
};
