export const BASE_URL = "https://Mobile-application-2.onrender.com/api";

export const getImageUri = (uri) => {
  const placeholderUrl = "https://via.placeholder.com/300x300.png?text=No+Image";

  if (!uri || typeof uri !== "string") return { uri: placeholderUrl };

  // Already an absolute URL (from cloud or external)
  if (uri.startsWith("http") || uri.startsWith("data:image")) return { uri };

  // Absolute path from backend
  if (uri.startsWith("/")) return { uri: `${BASE_URL}${uri}` };

  // Otherwise treat as filename in uploads folder
  return { uri: `${BASE_URL}/uploads/${uri}` };
};
