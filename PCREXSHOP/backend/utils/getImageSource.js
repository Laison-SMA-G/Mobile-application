// utils/getImageSource.js
export const BASE_URL = "http://192.168.100.45:5000";

// Returns an object suitable for React Native <Image source={...}>
export const getImageSource = (uri) => {
  const PLACEHOLDER = { uri: `${BASE_URL}/uploads/placeholder.png` };

  if (!uri || typeof uri !== "string" || uri.trim() === "") return PLACEHOLDER;
  if (uri.startsWith("http") || uri.startsWith("data:image")) return { uri };
  if (uri.startsWith("/")) return { uri: `${BASE_URL}${uri}` };

  // Replace backslashes for Windows paths
  return { uri: `${BASE_URL}/${uri.replace(/\\/g, "/")}` };
};
