// context/UserContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

 // flip the boolean value to switch between local and deployed backend

const isProd = true;
export const BASE_URL = isProd
  ? "https://mobile-application-2.onrender.com/api"
  : "http://localhost:5000/api";

axios.defaults.baseURL = BASE_URL;
const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;


  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(requestInterceptor);
  }, [token]);


  // Restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("@token");
        const savedUser = await AsyncStorage.getItem("user");

        if (savedToken) {
          setToken(savedToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser({ ...parsedUser, _id: parsedUser.id || parsedUser._id });
          } else {
            const res = await axios.get("/users/me");
            setUser({ ...res.data.user, _id: res.data.user.id || res.data.user._id });
            await AsyncStorage.setItem("user", JSON.stringify(res.data.user)); // Save for CartContext
          }
        }
      } catch (err) {
        console.error("Restore session error:", err.response?.data || err);
        await AsyncStorage.removeItem("@token");
        await AsyncStorage.removeItem("user");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Sign Up
  const signUp = async (fullName, email, password) => {
    setLoading(true);
    try {
      if (!fullName || !email || !password) return { success: false, message: "All fields are required" };
      if (!emailRegex.test(email)) return { success: false, message: "Invalid email — must end with @gmail.com" };

      const res = await axios.post("/auth/register", { fullName, email, password });
      const { user: userData, token: newToken } = res.data;

      setToken(newToken);
      await AsyncStorage.setItem("@token", newToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData)); // ✅ Save user for CartContext
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setUser({ ...userData, _id: userData.id || userData._id });

      return { success: true, user: userData };
    } catch (err) {
      console.error("Signup error:", err.response?.data || err);
      return { success: false, message: err.response?.data?.message || "Signup failed" };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sign In
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password) return { success: false, message: "All fields are required" };
      if (!emailRegex.test(email)) return { success: false, message: "Invalid email — must end with @gmail.com" };

      const res = await axios.post("/auth/login", { email, password });
      const { user: userData, token: newToken } = res.data;

      setToken(newToken);
      await AsyncStorage.setItem("@token", newToken);
      await AsyncStorage.setItem("user", JSON.stringify(userData)); // ✅ Save user for CartContext
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setUser({ ...userData, _id: userData.id || userData._id });

      return { success: true, user: userData };
    } catch (err) {
      console.error("Login error:", err.response?.data || err);
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sign Out
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("@token");
      await AsyncStorage.removeItem("user"); // ✅ remove user for CartContext
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common["Authorization"];
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // ✅ Update Profile
  const updateUserProfile = async (updatedData) => {
    if (!user?._id) {
      console.error("Missing user ID", user);
      return { success: false, message: "Missing user ID" };
    }

    try {
      const { data } = await axios.put("/users/profile", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUser = { ...data.user, _id: data.user.id || data.user._id };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser)); // ✅ keep AsyncStorage updated
      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, signUp, signIn, signOut, updateUserProfile, BASE_URL }),
    [user, token, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
  
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
