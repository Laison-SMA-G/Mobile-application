export const getImageUri = (imgPath) => {
  if (!imgPath) return require("../assets/no-image.png");
  if (imgPath.startsWith("http")) return { uri: imgPath };

  const BASE_URL = "https://mobile-application-2.onrender.com"; // Your deployed backend
  return { uri: `${BASE_URL}/${imgPath.replace(/^\/+/, "")}` };
};
