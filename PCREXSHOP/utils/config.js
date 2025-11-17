// utils/config.js
import Constants from 'expo-constants';

// Detect platform
const isWeb = Constants.platform?.web;

// LAN URL for local dev
const DEV_BASE_URL = "http://192.168.100.45:5000/api";

// Render / Production backend
const PROD_BASE_URL = "https://mobile-application-2.onrender.com/api";

// Use correct BASE_URL depending on platform and environment
export const BASE_URL = (() => {
  if (isWeb) {
    // Web dev: use local LAN backend to avoid CORS
    return DEV_BASE_URL;
  }

  // Mobile (Expo Go or EAS builds)
  // Use EAS environment variable if defined, otherwise fallback to PROD
  return Constants.manifest?.extra?.BASE_URL || PROD_BASE_URL;
})();
