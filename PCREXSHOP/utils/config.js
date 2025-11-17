// utils/config.js
import Constants from 'expo-constants';

// Detect environment
const isDevelopment = Constants.manifest?.packagerOpts !== undefined;

// Replace these with your actual URLs
export const DEV_BASE_URL = 'http://192.168.100.45:5000/api'; // LAN IP for local dev
export const PROD_BASE_URL = 'https://Mobile-application-2.onrender.com/api'; // Hosted backend

// Use the correct BASE_URL depending on environment
export const BASE_URL = isDevelopment ? DEV_BASE_URL : PROD_BASE_URL;
