// context/UserContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';



export const BASE_URL = "https://mobile-application-2.onrender.com/api";

// Set axios base URL
axios.defaults.baseURL = BASE_URL;

const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('@token');
        if (savedToken) {
          setToken(savedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const res = await axios.get('/users/me');
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Restore session error:', err.response?.data || err);
        await AsyncStorage.removeItem('@token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signUp = async (fullName, email, password) => {
    setLoading(true);
    try {
      if (!fullName || !email || !password)
        return { success: false, message: 'All fields are required' };
      if (!emailRegex.test(email))
        return { success: false, message: 'Invalid email — must end with @gmail.com' };

      const res = await axios.post('/auth/register', { fullName, email, password });
      const { user: userData, token: newToken } = res.data;
      setToken(newToken);
      await AsyncStorage.setItem('@token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error('Signup error:', err.response?.data || err);
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password)
        return { success: false, message: 'All fields are required' };
      if (!emailRegex.test(email))
        return { success: false, message: 'Invalid email — must end with @gmail.com' };

      const res = await axios.post('/auth/login', { email, password });
      const { user: userData, token: newToken } = res.data;
      setToken(newToken);
      await AsyncStorage.setItem('@token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@token');
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // ✅ Fixed: use id instead of _id
  const updateUserProfile = async (updatedData) => {
  if (!user?.id) {
    console.error('Missing user ID', user);
    return { success: false, message: 'Missing user ID' };
  }

  try {
    const { data } = await axios.put('/users/updateProfile', updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(data.user || data); // some responses might return {user: ...}
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
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
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
