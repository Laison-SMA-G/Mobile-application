// utils/getImageUri.js

// Base URL of your backend server
export const BASE_URL = "https://192.168.100.45:5000";

// Function to get the proper URI for images
export const getImageUri = (uri) => {
  // If no URI provided, return a default placeholder from a URL
  const placeholderUrl = "https://via.placeholder.com/300x300.png?text=No+Image";

  if (!uri || typeof uri !== "string") return { uri: placeholderUrl };

  // If it's already an absolute URL
  if (uri.startsWith("http") || uri.startsWith("data:image")) return { uri };

  // If it's a relative path from your backend
  if (uri.startsWith("/")) return { uri: `${BASE_URL}${uri}` };

  // Otherwise, treat it as a filename relative to uploads folder
  return { uri: `${BASE_URL}/uploads/${uri}` };
};
