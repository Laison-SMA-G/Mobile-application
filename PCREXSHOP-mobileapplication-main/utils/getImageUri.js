// utils/getImageUri.js
export const BASE_URL = "http://192.168.100.45:5000";

export const getImageUri = (uri) => {
  if (!uri || typeof uri !== "string") {
    // fallback placeholder
    return { uri: "https://placehold.co/150x150?text=No+Image" };
  }

  if (uri.startsWith("http") || uri.startsWith("data:image")) {
    return { uri };
  }

  return { uri: `${BASE_URL}${uri.startsWith("/") ? "" : "/"}${uri}` };
};
