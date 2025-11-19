// utils/getImageUri.js
export const BASE_URL = "https://mobile-application-2.onrender.com";

export const getImageUri = (uri) => {
  if (!uri || typeof uri !== "string") {
    return { uri: "https://placehold.co/150x150?text=No+Image" }; // fallback
  }

  if (uri.startsWith("http") || uri.startsWith("data:image")) {
    return { uri }; // full URL or base64
  }

  // relative path from server
  return { uri: `${BASE_URL}${uri.startsWith("/") ? uri : `/${uri}`}` };
};
