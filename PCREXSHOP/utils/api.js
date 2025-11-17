// utils/api.js
import { BASE_URL } from './config';
// Base URL of your backend API

/**
 * Returns a valid image source for React Native Image component
 * @param {string|null} imagePath - Relative path of the image from the backend
 * @returns {object} - Image source object compatible with <Image>
 */
export const getImageSource = (imagePath) => {
  if (!imagePath) {
    return { uri: 'https://via.placeholder.com/150' }; // remote placeholder
  }
  return { uri: `${BASE_URL}/${imagePath}` };
};


/**
 * Helper function to fetch products from backend
 * @returns {Promise<Array>} - Array of products
 */
export const fetchProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
};
