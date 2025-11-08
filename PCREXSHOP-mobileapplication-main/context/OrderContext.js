// File: context/OrderContext.js
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useUser, BASE_URL } from './UserContext.js';

const ORDERS_STORAGE_KEY = '@MyApp:orders_v2';
const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const { token } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load orders from backend if logged in
  useEffect(() => {
    if (!token) return setLoading(false);

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Persist orders to AsyncStorage as backup
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders)).catch((e) =>
      console.error('Failed to save orders locally:', e)
    );
  }, [orders, loading]);

  const placeOrder = async (orderData) => {
  try {
    const res = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Add the confirmed order from backend
    setOrders((prev) => [res.data.order, ...prev]);

    return { success: true, order: res.data.order };
  } catch (err) {
    console.error("❌ Failed to place order:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.error || "Failed to place order" };
  }
};



  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
  };

  const cancelOrder = (orderId) => {
    let wasCancelled = false;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId && (o.status === 'To Pay' || o.status === 'To Ship')) {
          wasCancelled = true;
          return { ...o, status: 'Cancelled' };
        }
        return o;
      })
    );
    return wasCancelled;
  };

  const value = useMemo(
    () => ({ orders, loading, placeOrder, updateOrderStatus, cancelOrder }),
    [orders, loading]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
};
