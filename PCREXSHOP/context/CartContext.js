// src/context/CartContext.js
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import axios from 'axios';

// 🔵 Backend API base URL
export const BASE_URL = "https://mobile-application-2.onrender.com/api";

const CART_STORAGE_KEY = '@MyApp:cart_v2';
const getCartStorageKey = (user) => {
  const uid = user && (user._id || user.id) ? (user._id || user.id) : 'guest';
  return `${CART_STORAGE_KEY}_${uid}`;
};

const CartContext = createContext();

// ✅ Normalize product data
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
    _id: id,
    stock: Number.isNaN(stock) ? 0 : stock,
    images,
    price,
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Load cart from backend or local storage
  useEffect(() => {
    let mounted = true;

    const loadCart = async () => {
      setIsLoadingCart(true);
      try {
        if (user && user._id) {
          // 🔵 Logged-in user
          const res = await axios.get(`${BASE_URL}/cart/${user._id}`);
          if (mounted) {
            const cartData = res.data?.cart?.items || [];
            const normalized = cartData.map(i => {
              const product = i?.productId || {};
              return {
                ...normalizeProduct(product),
                quantity: i?.quantity || 0,
              };
            });
            setCartItems(normalized);
          }
        } else {
          // 🔵 Guest user → local storage
          const key = getCartStorageKey(null);
          const raw = await AsyncStorage.getItem(key);
          if (mounted) setCartItems(raw ? JSON.parse(raw) : []);
        }
      } catch (err) {
        console.error("Cart load error:", err);
        if (mounted) setCartItems([]);
      } finally {
        if (mounted) setIsLoadingCart(false);
      }
    };

    loadCart();
    return () => { mounted = false };
  }, [user]);

  // Persist cart locally
  useEffect(() => {
    if (isLoadingCart) return;
    const key = getCartStorageKey(user);
    AsyncStorage.setItem(key, JSON.stringify(cartItems))
      .catch(e => console.error("Failed to persist cart:", e));
  }, [cartItems, user, isLoadingCart]);

  // Add to cart
  const addToCart = async (product) => {
    const p = normalizeProduct(product);
    if (!p._id) {
      console.error("❌ Cannot add to cart: missing _id", product);
      return;
    }

    try {
      if (user && user._id) {
        await axios.post(`${BASE_URL}/cart/add`, {
          userId: user._id,
          productId: p._id,
          quantity: 1,
        });
      }
    } catch (err) {
      console.error("Failed syncing addToCart:", err);
    }

    setCartItems(prev => {
      const existing = prev.find(i => i._id === p._id);
      if (existing) return prev.map(i => i._id === p._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  // Increase quantity
  const increaseQuantity = async (itemId) => {
    const item = cartItems.find(i => i._id === itemId);
    if (!item) return;

    try {
      if (user && user._id) {
        await axios.post(`${BASE_URL}/cart/add`, {
          userId: user._id,
          productId: item._id,
          quantity: 1,
        });
      }
    } catch (err) {
      console.error("Failed syncing increaseQuantity:", err);
    }

    setCartItems(prev =>
      prev.map(i => i._id === item._id ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i)
    );
  };

  // Decrease quantity
  const decreaseQuantity = async (itemId) => {
    const item = cartItems.find(i => i._id === itemId);
    if (!item) return;

    if (item.quantity === 1) return removeFromCart(item._id);

    try {
      if (user && user._id) {
        await axios.post(`${BASE_URL}/cart/add`, {
          userId: user._id,
          productId: item._id,
          quantity: -1,
        });
      }
    } catch (err) {
      console.error("Failed syncing decreaseQuantity:", err);
    }

    setCartItems(prev =>
      prev.map(i => i._id === item._id ? { ...i, quantity: Math.max(i.quantity - 1, 1) } : i)
    );
  };

  // Remove item
  const removeFromCart = async (itemId) => {
    const item = cartItems.find(i => i._id === itemId);
    if (!item) return;

    try {
      if (user && user._id) {
        await axios.delete(`${BASE_URL}/cart/${user._id}/${item._id}`);
      }
    } catch (err) {
      console.error("Failed syncing removeFromCart:", err);
    }

    setCartItems(prev => prev.filter(i => i._id !== item._id));
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (user && user._id) {
        await axios.delete(`${BASE_URL}/cart/${user._id}`);
      }
    } catch (err) {
      console.error("Failed syncing clearCart:", err);
    }
    setCartItems([]);
  };

  // Decrease stock after order
  const decreaseStock = (orderedItems = []) => {
    if (!Array.isArray(orderedItems) || !orderedItems.length) return;
    setCartItems(prev => {
      const idsToRemove = new Set(orderedItems.map(i => i._id || i.id));
      return prev.filter(ci => !idsToRemove.has(ci._id) && !idsToRemove.has(ci.id));
    });
  };

  const totalPrice = useMemo(() =>
    cartItems.reduce((acc, it) => acc + ((Number(it.price) || 0) * (it.quantity || 0)), 0),
    [cartItems]
  );

  const itemCount = useMemo(() =>
    cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0),
    [cartItems]
  );

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
