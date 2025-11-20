// utils/api.js
export const BASE_URL = "https://mobile-application-2.onrender.com/api";

// Fetch products from backend and format them
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Format each product
    return data.map((item) => {
      const quantity = typeof item.quantity === "number" ? item.quantity : 0;

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
  } catch (error) {
    console.error("❌ Error fetching products:", error.message || error);
    return [];
  }
};

// Get image source safely
export const getImageSource = (uri) => {
  if (!uri || typeof uri !== "string") {
    return { uri: "https://via.placeholder.com/150" };
  }
  return { uri };
};
