import { API_URL } from "../utils/api";


// api.js
export const BASE_URL = "https://Mobile-application-2.onrender.com/api"; 
export const API_URL = "https://Mobile-application-2.onrender.com/api"; 


// utils/api.js

/**
 * Generic GET request
 * @param {string} endpoint e.g. '/products'
 */
export async function get(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Fetch GET failed:", err);
    return { error: err.message };
  }
}

/**
 * Generic POST request
 * @param {string} endpoint e.g. '/products/add'
 * @param {object} body JSON body
 */
export async function post(endpoint, body) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Fetch POST failed:", err);
    return { error: err.message };
  }
}
