import { API_URL } from "../utils/api";


// api.js
export const BASE_URL = "https://pcrex-server.onrender.com"; // for general backend fetches
export const API_URL = "https://pcrex-server.onrender.com";  // for products or other API calls


fetch(`${API_URL}/api/products`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
