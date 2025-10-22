// File: context/UserContext.js
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ⚙️ Change this IP to your backend's local network IP
export const BASE_URL = 'http://192.168.43.96:5000/api';

axios.defaults.baseURL = BASE_URL;

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore token + user session
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
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ✅ Sign in
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/users/login', { email, password });
      const { user: userData, token: newToken } = res.data;

      setUser(userData);
      setToken(newToken);
      await AsyncStorage.setItem('@token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sign up
  const signUp = async (fullName, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/users/register', { fullName, email, password });
      const { user: userData, token: newToken } = res.data;

      setUser(userData);
      setToken(newToken);
      await AsyncStorage.setItem('@token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true, user: userData };
    } catch (err) {
      console.error('Signup error:', err.response?.data || err);
      return { success: false, message: err.response?.data?.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update user profile
  const updateUserProfile = async (newUserData) => {
    setLoading(true);
    try {
      const response = await axios.put('/users/updateProfile', newUserData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Profile update response:', response.data);

      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      console.error('Update profile error:', err.response?.status, err.response?.data || err);
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sign out
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

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signUp,
      signOut,
      updateUserProfile,
      BASE_URL,
    }),
    [user, token, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};
