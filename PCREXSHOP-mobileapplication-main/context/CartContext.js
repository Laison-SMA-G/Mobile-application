// src/context/CartContext.js
import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext'; // same folder

const CART_STORAGE_KEY = '@MyApp:cart_v2';

const getCartStorageKey = (user) => {
  const uid = user && (user._id || user.id) ? (user._id || user.id) : 'guest';
  return `${CART_STORAGE_KEY}_${uid}`;
};

const CartContext = createContext();

const normalizeProduct = (p = {}) => {
  const id = p._id || p.id || (p.productId && (p.productId._id || p.productId)) || null;
  // stock: prefer explicit stock, fallback to quantity, else 0
  const stock = p.stock !== undefined && p.stock !== null
    ? Number(p.stock)
    : (p.quantity !== undefined && p.quantity !== null ? Number(p.quantity) : 0);

  // ensure images is an array
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
  const { user } = useUser(); // user can be null (guest)
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Load cart for current user (runs on mount and when user changes)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoadingCart(true);
      try {
        const key = getCartStorageKey(user);
        const raw = await AsyncStorage.getItem(key);
        if (raw && mounted) {
          setCartItems(JSON.parse(raw));
        } else if (mounted) {
          setCartItems([]);
        }
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

  // Persist cart when it changes (saved under current user's key)
  useEffect(() => {
    if (isLoadingCart) return; // avoid writing while initial load
    const key = getCartStorageKey(user);
    AsyncStorage.setItem(key, JSON.stringify(cartItems)).catch(e => {
      console.error('Failed to persist cart', e);
    });
  }, [cartItems, user, isLoadingCart]);

  // Add to cart: normalize product, ensure 1 on first add, respect stock
  const addToCart = (product) => {
    const p = normalizeProduct(product);
    setCartItems(prev => {
      // if no id, generate a fallback id (shouldn't happen if backend returns _id)
      const id = p.id || `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
      // find existing by id or _id
      const existing = prev.find(i => (i.id && p.id && i.id === p.id) || (i._id && p._id && i._id === p._id));
      if (existing) {
        // increase while respecting stock
        return prev.map(i => {
          const same = (i.id && p.id && i.id === p.id) || (i._id && p._id && i._id === p._id);
          if (!same) return i;
          const nextQty = (i.quantity || 0) + 1;
          return { ...i, quantity: Math.min(nextQty, p.stock) };
        });
      } else {
        // add new with quantity:1 and include normalized fields
        return [...prev, {
          ...p,
          id, // ensure id present
          quantity: 1,
        }];
      }
    });
  };

  const increaseQuantity = (itemId) => {
    setCartItems(prev => prev.map(item => {
      const match = item.id === itemId || item._id === itemId;
      if (!match) return item;
      const max = item.stock ?? 0;
      const next = (item.quantity || 0) + 1;
      if (next > max) return item; // do not exceed stock
      return { ...item, quantity: next };
    }));
  };

  const decreaseQuantity = (itemId) => {
    setCartItems(prev => prev.map(item => {
      const match = item.id === itemId || item._id === itemId;
      if (!match) return item;
      const next = (item.quantity || 0) - 1;
      return { ...item, quantity: next < 1 ? 1 : next }; // keep min 1 (UI removes on trash)
    }));
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => !(item.id === itemId || item._id === itemId)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Remove ordered items from cart (or you may call backend to update stock)
  const decreaseStock = (orderedItems = []) => {
    const orderedIds = new Set(orderedItems.map(i => i.id || i._id));
    setCartItems(prev => prev.filter(ci => !orderedIds.has(ci.id) && !orderedIds.has(ci._id)));
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + ((Number(it.price) || 0) * (it.quantity || 0)), 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0);
  }, [cartItems]);

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
