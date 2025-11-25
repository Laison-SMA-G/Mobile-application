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

  // const mockorder = {
  //   items:  [{
  //     _id:"69253a23a632dd782efb12ae",
  //       name: "Biostar A520MHP Socket AM4 DDR4 Motherboard",
  //       price:"3500",
  //       quantity:6,
  //       image: "https://res.cloudinary.com/dggvqyg57/image/upload/v1763688847/products…"
  // }]
  // }

  // Place new regular order
 const placeOrder = async (orderDetails) => {
  if (!user || !token) {
    Alert.alert('Error', 'You must be logged in to place an order.');
    return;
  }

  setLoading(true);
  try {
    const fixedItems = (orderDetails.items || []).map(item => {
      console.log(item);
      // If custom build, don't send _id
      if (item.type === "pc-build" || item.custom) {
        return {
          _id:item._id,
          name: item.name,
          price: item.price,
          quantity: item?.quantity || item?.stock || 1,
          image: item.image || (item.images && item.images[0]) || '/uploads/placeholder.png',
        };
      }

      // Normal product
      return {
        _id: item._id, // only valid Mongo ObjectIds
        name: item.name,
        price: item.price,
        quantity: item?.quantity || item?.stock || 1,
        image: item.image || (item.images && item.images[0]) || '/uploads/placeholder.png',
      };
    });

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
    console.log(payload);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to place order');
    }

    const responseJson = await res.json();
    const createdOrder = responseJson.order || responseJson;

    setOrders(prev => [createdOrder, ...prev]);
    Alert.alert('Success', 'Your order has been placed!');
  } catch (err) {
    console.error('Failed to place order:', err);
    Alert.alert('Error', 'Unable to place your order.');
  } finally {
    setLoading(false);
  }
};


  // Place builder/custom order
  const placeBuilderOrder = async (builderCart, additionalDetails = {}) => {
    if (!user || !token) {
      Alert.alert('Error', 'You must be logged in to place an order.');
      return;
    }

    if (!builderCart || builderCart.length === 0) {
      Alert.alert('Error', 'Your builder cart is empty.');
      return;
    }

    setLoading(true);
    try {
      const builderItems = builderCart.map(build => ({
        name: build.name || 'Custom Build',
        price: build.price,
        quantity: build.quantity || 1,
        image: build.image || (build.images && build.images[0]) || '/uploads/placeholder.png',
        custom: true, // mark as custom so backend knows
      }));

      const payload = {
        ...additionalDetails,
        items: builderItems,
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
        throw new Error(text || 'Failed to place builder order');
      }

      const responseJson = await res.json();
      const createdOrder = responseJson.order || responseJson;
      setOrders(prev => [createdOrder, ...prev]);
      Alert.alert('Success', 'Your custom build order has been placed!');
    } catch (err) {
      console.error('Failed to place builder order:', err);
      Alert.alert('Error', 'Unable to place your custom build order.');
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
      value={{ orders, loading, fetchOrders, placeOrder, placeBuilderOrder, cancelOrder }}
    >
      {children}
    </OrderContext.Provider>
  );
};
