// utils/fetchProducts.js

export const fetchProducts = async () => {
  try {
    const response = await fetch("https://mobile-application-2.onrender.com/api/products");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const products = await response.json();

    // Build a map for quick lookup by productId
    const map = {};
    products.forEach((p) => (map[p._id] = p));
    return map;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {};
  }
};
