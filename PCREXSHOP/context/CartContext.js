// src/context/CartContext.js
import React, { createContext, useState, useContext, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import axios from 'axios';
import { Alert } from 'react-native';

// Backend API base URL
export const BASE_URL = "https://mobile-application-2.onrender.com/api";

const CART_STORAGE_KEY = '@MyApp:cart_v2';
const getCartStorageKey = (user) => {
  const uid = user && (user._id || user.id) ? (user._id || user.id) : 'guest';
  return `${CART_STORAGE_KEY}_${uid}`;
};

const CartContext = createContext();

/**
 * Normalize a product/object into the cart item shape used across the app.
 *
 * - For normal products coming from your backend: keep _id, stock, images, price.
 * - For components added from the builder: expect they have a valid _id (real Mongo ID).
 * - For safety, do NOT create fake ObjectIds. If _id is missing, treat as guest/local-only item
 *   but avoid sending non-ObjectId strings to the server.
 */
const normalizeProduct = (p = {}) => {
  // Defensive copy
  const prod = { ...p };

  // Images normalization
  const images = Array.isArray(prod.images) && prod.images.length
    ? prod.images
    : (prod.image ? [prod.image] : []);

  // Price normalization
  const price = (prod.price !== undefined && prod.price !== null) ? Number(prod.price) : 0;

  // stock normalization (if comes from backend product schema)
  const stock = prod.stock !== undefined && prod.stock !== null
    ? Number(prod.stock)
    : (prod.quantity !== undefined && prod.quantity !== null ? Number(prod.quantity) : 0);

  // Determine id/_id
  const id = prod._id || prod.id || (prod.productId && (prod.productId._id || prod.productId)) || null;

  // If id is present but not a valid-looking ObjectId, we still keep it in UI but do not send it to server
  // (server calls will check and ignore non-ObjectId for custom items)
  return {
    // Raw original fields kept for flexibility
    ...prod,
    id,
    _id: id,
    images,
    price,
    stock: Number.isNaN(stock) ? 0 : stock,
    quantity: prod.quantity !== undefined ? Number(prod.quantity) : 1,
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const mountedRef = useRef(true);

  // Load cart initially: if logged-in, load from server; otherwise load from AsyncStorage
  useEffect(() => {
    mountedRef.current = true;
    const loadCart = async () => {
      setIsLoadingCart(true);
      try {
        if (user && user._id) {
          // Logged-in: fetch server cart and normalize
          const res = await axios.get(`${BASE_URL}/cart/${user._id}`);
          const serverItems = res.data?.cart?.items || [];
          const normalized = serverItems.map(ci => {
            const product = ci?.productId || {};
            // normalize product and attach server quantity
            return normalizeProduct({ ...product, quantity: ci.quantity });
          });
          if (mountedRef.current) setCartItems(normalized);
        } else {
          // Guest: load from local storage
          const key = getCartStorageKey(null);
          const raw = await AsyncStorage.getItem(key);
          if (mountedRef.current) setCartItems(raw ? JSON.parse(raw) : []);
        }
      } catch (err) {
        console.error('Cart load error:', err);
        if (mountedRef.current) setCartItems([]);
      } finally {
        if (mountedRef.current) setIsLoadingCart(false);
      }
    };

    loadCart();
    return () => { mountedRef.current = false };
  }, [user]);

  // Persist cart locally whenever it changes (including after login merge)
  useEffect(() => {
    if (isLoadingCart) return;
    const persist = async () => {
      try {
        const key = getCartStorageKey(user);
        await AsyncStorage.setItem(key, JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to persist cart:', e);
      }
    };
    persist();
  }, [cartItems, user, isLoadingCart]);

  /**
   * Merge guest local cart into server cart (called when a user logs in).
   * Strategy:
   *  - For items with valid _id (server products): call backend add endpoint for each, then load server cart.
   *  - For items without _id (pure local items) keep them in server as guest-only items (persist locally).
   */
  const mergeLocalCartToServer = async (localItems = []) => {
    if (!user || !user._id || !Array.isArray(localItems) || localItems.length === 0) return;

    try {
      // For each local item that has a valid _id, attempt to add it to the server cart
      for (const it of localItems) {
        const normalized = normalizeProduct(it);
        if (normalized._id) {
          // tell server to add this product
          try {
            await axios.post(`${BASE_URL}/cart/add`, {
              userId: user._id,
              productId: normalized._id,
              quantity: normalized.quantity || 1,
            });
          } catch (err) {
            // Log and continue; do not block the merge for one failing item
            console.warn('Cart merge: failed adding item to server cart', normalized._id, err?.response?.data || err.message || err);
          }
        } else {
          // item without _id remains local (we'll keep it in cartItems)
          // nothing to do server-side
        }
      }

      // Finally re-fetch server cart and merge any remaining local-only items
      const res = await axios.get(`${BASE_URL}/cart/${user._id}`);
      const serverItems = res.data?.cart?.items || [];
      const normalizedServer = serverItems.map(ci => normalizeProduct({ ...ci.productId, quantity: ci.quantity }));

      // Keep local-only items (no _id) and append them after server items
      const localOnly = localItems
        .map(i => normalizeProduct(i))
        .filter(i => !i._id);

      // Merge with dedupe: if server already has a product, prefer server quantity
      const merged = [...normalizedServer];

      for (const local of localOnly) {
        // If there is a server item with same name and no _id conflict, just push local item
        merged.push(local);
      }

      setCartItems(merged);
    } catch (err) {
      console.error('Failed to merge local cart to server:', err);
    }
  };

  // If user just changed from guest -> logged in, merge local guest cart into server
  const prevUserRef = useRef(user);
  useEffect(() => {
    const runMerge = async () => {
      // only run when previously no user and now user exists
      if (!prevUserRef.current && user && user._id) {
        // load guest cart
        try {
          const guestKey = getCartStorageKey(null);
          const raw = await AsyncStorage.getItem(guestKey);
          const localItems = raw ? JSON.parse(raw) : [];
          await mergeLocalCartToServer(localItems || []);
        } catch (e) {
          console.error('Error while merging local cart on login:', e);
        }
      }
      prevUserRef.current = user;
    };
    runMerge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Add product to cart
  const addToCart = async (productInput) => {
    // productInput can be:
    // - product from server (has _id)
    // - builder component (should have valid _id from your Item.json/products)
    // - guest local item w/o _id (rare)
    const p = normalizeProduct(productInput);

    // Try to sync to backend only when we have user and valid _id
    if (p._id && user && user._id) {
      try {
        await axios.post(`${BASE_URL}/cart/add`, {
          userId: user._id,
          productId: p._id,
          quantity: p.quantity || 1,
        });
      } catch (err) {
        console.error('Failed syncing addToCart:', err?.response?.data || err.message || err);
        // continue: still add to UI
      }
    }

    setCartItems(prev => {
      // If an item with same real _id exists, increase quantity
      if (p._id) {
        const existing = prev.find(i => i._id === p._id);
        if (existing) {
          return prev.map(i => i._id === p._id ? { ...i, quantity: Math.min((i.quantity || 0) + (p.quantity || 1), i.stock || Infinity) } : i);
        }
        return [...prev, { ...p, quantity: p.quantity || 1 }];
      }

      // If no _id (local-only item), dedupe by name + type
      const existingLocal = prev.find(i => !i._id && i.name === p.name && i.type === p.type);
      if (existingLocal) {
        return prev.map(i => (!i._id && i.name === p.name && i.type === p.type) ? { ...i, quantity: (i.quantity || 0) + (p.quantity || 1) } : i);
      }
      return [...prev, { ...p, quantity: p.quantity || 1 }];
    });
  };

  // Increase quantity (works for items with _id and local-only)
  const increaseQuantity = async (itemIdOrKey) => {
    // itemIdOrKey: prefer _id for items with real id, otherwise pass an index or name-based key from UI
    const item = cartItems.find(i => i._id === itemIdOrKey || (i.name === itemIdOrKey && !i._id));
    if (!item) return;

    // If server product, sync
    if (item._id && user && user._id) {
      try {
        await axios.post(`${BASE_URL}/cart/add`, {
          userId: user._id,
          productId: item._id,
          quantity: 1,
        });
      } catch (err) {
        console.error('Failed syncing increaseQuantity:', err?.response?.data || err.message || err);
      }
    }

    setCartItems(prev => prev.map(i => {
      if ((i._id && i._id === item._id) || (!i._id && i.name === item.name && i.type === item.type)) {
        const nextQty = Math.min((i.quantity || 0) + 1, i.stock || Infinity);
        return { ...i, quantity: nextQty };
      }
      return i;
    }));
  };

  // Decrease quantity
  const decreaseQuantity = async (itemIdOrKey) => {
    const item = cartItems.find(i => i._id === itemIdOrKey || (i.name === itemIdOrKey && !i._id));
    if (!item) return;

    if ((item.quantity || 0) <= 1) {
      // remove item
      return removeFromCart(item._id || (item.name + '::' + (item.type || '')));
    }

    // If server product, sync
    if (item._id && user && user._id) {
      try {
        await axios.post(`${BASE_URL}/cart/add`, {
          userId: user._id,
          productId: item._id,
          quantity: -1,
        });
      } catch (err) {
        console.error('Failed syncing decreaseQuantity:', err?.response?.data || err.message || err);
      }
    }

    setCartItems(prev => prev.map(i => {
      if ((i._id && i._id === item._id) || (!i._id && i.name === item.name && i.type === item.type)) {
        return { ...i, quantity: Math.max((i.quantity || 1) - 1, 1) };
      }
      return i;
    }));
  };

  // Remove from cart
  const removeFromCart = async (itemIdOrKey) => {
    // itemIdOrKey may be _id or name::type key for local-only
    const item = cartItems.find(i => i._id === itemIdOrKey || (itemIdOrKey.includes('::') && (i.name + '::' + (i.type || '')) === itemIdOrKey) || (!itemIdOrKey.includes('::') && i.name === itemIdOrKey && !i._id));
    if (!item) return;

    // If server product, delete server-side
    if (item._id && user && user._id) {
      try {
        await axios.delete(`${BASE_URL}/cart/${user._id}/${item._id}`);
      } catch (err) {
        console.error('Failed syncing removeFromCart:', err?.response?.data || err.message || err);
      }
    }

    setCartItems(prev => prev.filter(i => !((i._id && i._id === item._id) || (!i._id && i.name === item.name && i.type === item.type))));
  };

  // Clear cart
  const clearCart = async () => {
    if (user && user._id) {
      try {
        await axios.delete(`${BASE_URL}/cart/${user._id}`);
      } catch (err) {
        console.error('Failed syncing clearCart:', err?.response?.data || err.message || err);
      }
    }
    setCartItems([]);
  };

  // After a successful order, remove ordered items from cart
  // orderedItems should be array of objects with either _id or name/type for local-only
  const decreaseStock = (orderedItems = []) => {
    if (!Array.isArray(orderedItems) || !orderedItems.length) return;
    const idsOrKeys = new Set(orderedItems.map(i => i._id || (i.name + '::' + (i.type || ''))));
    setCartItems(prev => prev.filter(ci => {
      const key = ci._id || (ci.name + '::' + (ci.type || ''));
      return !idsOrKeys.has(key);
    }));
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

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
