// utils/axiosconfig.js
import axios from 'axios';
import Constants from 'expo-constants';

const LOCAL_IP = '192.168.100.45:5000'; // replace with your dev machine IP
const PROD_URL = 'https://mobile-application-2.onrender.com';

const isDevelopment = Constants.manifest?.packagerOpts !== undefined;

// Base URL depending on environment
const BASE_URL = isDevelopment
  ? `http://${LOCAL_IP}/api`
  : `${PROD_URL}/api`;

const api = axios.create({
  baseURL: "http://192.168.100.45:5000/api",
  timeout: 10000,
});

// Optional: response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
