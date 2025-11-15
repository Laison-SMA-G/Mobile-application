// src/context/CartContext.js
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';

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
        const key = getCartStorageKey(user);
        const raw = await AsyncStorage.getItem(key);
        if (raw && mounted) setCartItems(JSON.parse(raw));
        else if (mounted) setCartItems([]);
      } catch (e) {
        console.error('Cart load error', e);
        if (mounted) setCartItems([]);
      } finally {
        if (mounted) setIsLoadingCart(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  // Persist cart
  useEffect(() => {
    if (isLoadingCart) return;
    const key = getCartStorageKey(user);
    AsyncStorage.setItem(key, JSON.stringify(cartItems)).catch(e => console.error('Failed to persist cart', e));
  }, [cartItems, user, isLoadingCart]);

  // Cart operations
  const addToCart = (product) => {
    const p = normalizeProduct(product);
    setCartItems(prev => {
      const existing = prev.find(i => (i.id && p.id && i.id === p.id) || (i._id && p._id && i._id === p._id));
      if (existing) {
        return prev.map(i => {
          const same = (i.id && p.id && i.id === p.id) || (i._id && p._id && i._id === p._id);
          if (!same) return i;
          const nextQty = (i.quantity || 0) + 1;
          return { ...i, quantity: Math.min(nextQty, p.stock) };
        });
      } else {
        return [...prev, { ...p, quantity: 1 }];
      }
    });
  };

  const increaseQuantity = (itemId) => {
    setCartItems(prev => prev.map(item => {
      if (!(item.id === itemId || item._id === itemId)) return item;
      const max = item.stock ?? 0;
      const next = (item.quantity || 0) + 1;
      return { ...item, quantity: next > max ? max : next };
    }));
  };

  const decreaseQuantity = (itemId) => {
    setCartItems(prev => prev.map(item => {
      if (!(item.id === itemId || item._id === itemId)) return item;
      const next = (item.quantity || 0) - 1;
      return { ...item, quantity: next < 1 ? 1 : next };
    }));
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => !(item.id === itemId || item._id === itemId)));
  };

  const clearCart = () => setCartItems([]);

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
