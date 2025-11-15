// src/context/OrderContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useUser } from './UserContext';

export const BASE_URL = "http://192.168.100.45:5000/api";

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { user, token, loading: loadingUser } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch current user's orders
  const fetchOrders = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      Alert.alert('Error', 'Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  // Place new order
  const placeOrder = async (orderDetails) => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to place an order.');
      return;
    }

    setLoading(true);
    try {
      // Ensure items always include single image field (backend expects item.image)
      const fixedItems = (orderDetails.items || []).map(item => ({
        _id: item._id || item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        // prioritize item.image, fallback to first images element, then to placeholder path
        image: item.image || (item.images && item.images[0]) || '/uploads/placeholder.png',
      }));

      const payload = {
        ...orderDetails,
        items: fixedItems,
      };

      const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to place order');
      }

      const responseJson = await res.json();

      // backend may return either the created order directly or { message, order }
      const createdOrder = responseJson.order || responseJson;

      // Prepend created order to local orders
      setOrders(prev => [createdOrder, ...prev]);

      Alert.alert('Success', 'Your order has been placed!');
    } catch (err) {
      console.error('Failed to place order:', err);
      // Show server error message when possible (JSON string or plain text)
      try {
        const parsed = typeof err.message === 'string' ? JSON.parse(err.message) : null;
        if (parsed && parsed.error) {
          Alert.alert('Error', parsed.error);
        } else {
          Alert.alert('Error', 'Unable to place your order.');
        }
      } catch {
        Alert.alert('Error', 'Unable to place your order.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId) => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to cancel an order.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to cancel order');
      }

      const responseJson = await res.json();
      const updatedOrder = responseJson.order || responseJson;

      // Update local orders list to reflect server state
      setOrders(prev => prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o)));

      Alert.alert('Success', 'Order cancelled successfully!');
      return true;
    } catch (err) {
      console.error('Failed to cancel order:', err);
      Alert.alert('Error', 'Unable to cancel this order.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchOrders();
  }, [user, token]);

  return (
    <OrderContext.Provider
      value={{ orders, loading, fetchOrders, placeOrder, cancelOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
};
