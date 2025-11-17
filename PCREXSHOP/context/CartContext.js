// src/context/CartContext.js
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import axios from "axios";


const API_BASE = "http://192.168.100.45:5000/api/cart"; 

const CART_STORAGE_KEY = '@MyApp:cart_v2';

const getCartStorageKey = (user) => {
  const uid = user && (user._id || user.id) ? (user._id || user.id) : 'guest';
  return `${CART_STORAGE_KEY}_${uid}`;
};

const CartContext = createContext();

const normalizeProduct = (p = {}) => {
  const id = p._id || p.id || (p.productId && (p.productId._id || p.productId)) || null;
  const stock = p.stock !== undefined && p.stock !== null
    ? Number(p.stock)
    : (p.quantity !== undefined && p.quantity !== null ? Number(p.quantity) : 0);
  const images = Array.isArray(p.images) && p.images.length
    ? p.images
    : (p.image ? [p.image] : []);
  const price = (p.price !== undefined && p.price !== null) ? Number(p.price) : 0;

  return {
    ...p,
    id,
    _id: p._id || p.id || id,
    stock: Number.isNaN(stock) ? 0 : stock,
    images,
    price,
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Load cart on mount or user change
  useEffect(() => {
  let mounted = true;

  const load = async () => {
    setIsLoadingCart(true);

    try {
      const userJson = await AsyncStorage.getItem("user");
      const savedUser = userJson ? JSON.parse(userJson) : null;

      if (savedUser && savedUser._id) {
        // 🔵 Load cart from backend
        const res = await axios.get(`${API_BASE}/cart/${savedUser._id}`);

        if (mounted) {
          const normalized = res.data.items.map(i => ({
            ...normalizeProduct(i.productId), // Ensure product formatting matches app UI
            quantity: i.quantity,
          }));

          setCartItems(normalized);
        }

      } else {
        // 🔵 Load guest cart from local storage
        const key = getCartStorageKey(null);
        const raw = await AsyncStorage.getItem(key);

        if (raw && mounted) setCartItems(JSON.parse(raw));
        else if (mounted) setCartItems([]);
      }

    } catch (e) {
      console.error("Cart load error", e);
      if (mounted) setCartItems([]);
    } finally {
      if (mounted) setIsLoadingCart(false);
    }
  };

  load();
  return () => { mounted = false };
}, []);

  // Persist cart
  useEffect(() => {
    if (isLoadingCart) return;
    const key = getCartStorageKey(user);
    AsyncStorage.setItem(key, JSON.stringify(cartItems)).catch(e => console.error('Failed to persist cart', e));
  }, [cartItems, user, isLoadingCart]);

  // Cart operations
  const addToCart = async (product) => {
  const p = normalizeProduct(product);

  try {
    if (user && user._id) {
      await axios.post(`${API_BASE}/add`, {
        userId: user._id,
        productId: p._id,
        quantity: 1,
      });
    }
  } catch (err) {
    console.error("❌ Failed syncing addToCart:", err);
  }

  setCartItems(prev => {
    const existing = prev.find(i => i._id === p._id);
    if (existing) {
      return prev.map(i =>
        i._id === p._id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      return [...prev, { ...p, quantity: 1 }];
    }
  });
};


  const increaseQuantity = async (itemId) => {
  const item = cartItems.find(i => i._id === itemId);
  if (!item) return;

  try {
    if (user && user._id) {
      await axios.post(`${API_BASE}/add`, {
        userId: user._id,
        productId: itemId,
        quantity: 1,
      });
    }
  } catch (err) {
    console.error("❌ Failed syncing increaseQuantity:", err);
  }

  setCartItems(prev =>
    prev.map(i =>
      i._id === itemId ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i
    )
  );
};


  const decreaseQuantity = async (itemId) => {
  const item = cartItems.find(i => i._id === itemId);
  if (!item) return;

  // If quantity becomes 0 → remove
  if (item.quantity === 1) {
    return removeFromCart(itemId);
  }

  try {
    if (user && user._id) {
      await axios.delete(`${API_BASE}/${user._id}/${itemId}`);
      await axios.post(`${API_BASE}/add`, {
        userId: user._id,
        productId: itemId,
        quantity: item.quantity - 1,
      });
    }
  } catch (err) {
    console.error("❌ Failed syncing decreaseQuantity:", err);
  }

  setCartItems(prev =>
    prev.map(i =>
      i._id === itemId ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i
    )
  );
};


  const removeFromCart = async (itemId) => {
  try {
    if (user && user._id) {
      await axios.delete(`${API_BASE}/${user._id}/${itemId}`);
    }
  } catch (err) {
    console.error("❌ Failed syncing removeFromCart:", err);
  }

  setCartItems(prev => prev.filter(i => i._id !== itemId));
};


  const clearCart = async () => {
  try {
    if (user && user._id) {
      await axios.delete(`${API_BASE}/${user._id}`);
    }
  } catch (err) {
    console.error("❌ Failed syncing clearCart:", err);
  }

  setCartItems([]);
};


  // NEW: Decrease stock or remove ordered items robustly
  const decreaseStock = (orderedItems = []) => {
    if (!Array.isArray(orderedItems) || !orderedItems.length) return;
    setCartItems(prev => {
      const idsToRemove = new Set(orderedItems.map(i => i._id || i.id));
      return prev.filter(ci => !idsToRemove.has(ci._id) && !idsToRemove.has(ci.id));
    });
  };

  const totalPrice = useMemo(() => cartItems.reduce((acc, it) => acc + ((Number(it.price) || 0) * (it.quantity || 0)), 0), [cartItems]);
  const itemCount = useMemo(() => cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0), [cartItems]);

  const value = {
    cartItems,
    isLoadingCart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    decreaseStock,
    totalPrice,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
