// src/context/OrderContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useUser } from './UserContext';

export const BASE_URL = "https://mobile-application-2.onrender.com/api";

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { user, token, loading: loadingUser } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Helper: ensure items always have full image URLs and quantity ---
  const formatItemImages = (item) => {
    const placeholder = 'https://placehold.co/150x150?text=No+Image';

    // Ensure images array exists
    const images = (item.images && item.images.length
        ? item.images
        : item.image
          ? [item.image]
          : [placeholder]
      ).map(uri => {
        if (!uri) return placeholder;
        if (uri.startsWith('http') || uri.startsWith('data:image')) return uri;
        return `${BASE_URL}${uri.startsWith('/') ? uri : `/${uri}`}`;
      });

    return {
      ...item,
      images,
      image: images[0],
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
    };
  };

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

      // Format items to ensure valid image URLs
      const formattedOrders = data.map(order => ({
        ...order,
        items: order.items.map(formatItemImages),
      }));

      setOrders(formattedOrders);
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
      // Ensure each item has image and images array
      const fixedItems = (orderDetails.items || []).map(formatItemImages);

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
      const createdOrder = responseJson.order || responseJson;

      // Format items in newly created order
      const formattedCreatedOrder = {
        ...createdOrder,
        items: createdOrder.items.map(formatItemImages),
      };

      // Prepend new order to local state
      setOrders(prev => [formattedCreatedOrder, ...prev]);

      Alert.alert('Success', 'Your order has been placed!');
    } catch (err) {
      console.error('Failed to place order:', err);
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

      // Format items in updated order
      const formattedUpdatedOrder = {
        ...updatedOrder,
        items: updatedOrder.items.map(formatItemImages),
      };

      setOrders(prev => prev.map(o => (o._id === formattedUpdatedOrder._id ? formattedUpdatedOrder : o)));

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
