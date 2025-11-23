// utils/getFullImageUrl.js
export const getFullImageUrl = (uri) => {
  if (!uri || typeof uri !== 'string') return 'https://placehold.co/150x150?text=No+Image';
  if (uri.startsWith('http') || uri.startsWith('data:image')) return uri; // already full URL or base64
  // If relative path from backend, convert to Cloudinary full URL
  return `https://res.cloudinary.com/dggvqyg57/image/upload/${uri}`;
};
