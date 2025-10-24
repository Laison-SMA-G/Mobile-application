// context/UserContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ⚙️ Change this to your backend API URL
export const BASE_URL = 'http://192.168.43.96:5000/api';
axios.defaults.baseURL = BASE_URL;

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Regex to allow only Gmail
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('@token');
        console.log('Saved token:', savedToken);

        if (savedToken) {
          setToken(savedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

          const res = await axios.get('/users/me'); // protected route
          setUser(res.data.user);
          console.log('Session restored successfully');
        }
      } catch (err) {
        console.error('Restore session error:', err.response?.data || err);
        await AsyncStorage.removeItem('@token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Sign up
  const signUp = async (fullName, email, password) => {
    setLoading(true);
    try {
      if (!fullName || !email || !password) {
        return { success: false, message: 'All fields are required' };
      }

      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email — must end with @gmail.com' };
      }

      const res = await axios.post('/auth/register', { fullName, email, password });
      const { user: userData, token: newToken } = res.data;

      // Save token
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

  // Sign in
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      if (!email || !password) {
        return { success: false, message: 'All fields are required' };
      }

      if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email — must end with @gmail.com' };
      }

      const res = await axios.post('/auth/login', { email, password });
      const { user: userData, token: newToken } = res.data;

      // Save token
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

  // Sign out
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

  // Update user profile
  const updateUserProfile = async (newUserData) => {
    setLoading(true);
    try {
      const res = await axios.put('/users/updateProfile', newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err);
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    } finally {
      setLoading(false);
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
