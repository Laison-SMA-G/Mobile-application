// utils/getImageUri.js

import { Platform } from "react-native";

// Local placeholder
const localPlaceholder = require("../assets/images/placeholder.png");

export const BASE_URL = "https://192.168.100.45:5000";

export const getImageUri = (uri) => {
  // If no URI provided, return the local placeholder
  if (!uri || typeof uri !== "string") return localPlaceholder;

  // Absolute URL
  if (uri.startsWith("http") || uri.startsWith("data:image")) return { uri };

  // Relative path from backend
  if (uri.startsWith("/")) return { uri: `${BASE_URL}${uri}` };

  // Otherwise, treat it as filename relative to uploads folder
  return { uri: `${BASE_URL}/uploads/${uri}` };
};
