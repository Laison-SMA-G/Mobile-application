// context/ShippingContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useUser } from "./UserContext";
import axios from "axios";

const isProd = true;
export const BASE_URL = isProd
  ? "https://mobile-application-2.onrender.com/api"
  : "http://192.168.0.102:5000/api";

axios.defaults.baseURL = BASE_URL;

const ShippingContext = createContext();
export const useShipping = () => useContext(ShippingContext);

export const ShippingProvider = ({ children }) => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shippingProviders, setShippingProviders] = useState([]);
  const [selectedShippingProvider, setSelectedShippingProvider] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = AsyncStorage.getItem("@token");

  // ==============================
  // FETCH ADDRESSES
  // ==============================
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      if (!user?._id) {
        setAddresses([]);
        setSelectedAddress(null);
        return;
      }

      const res = await axios.get(`/address/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userAddresses = res.data.addresses || [];
      setAddresses(userAddresses);

      const defaultAddr = userAddresses.find((a) => a.isDefault);
      setSelectedAddress(defaultAddr || userAddresses[0] || null);
    } catch (err) {
      console.error("Fetch addresses API error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch addresses.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ADD ADDRESS
  // ==============================
  const addAddress = async (addressData) => {
    setLoading(true);
    try {
      await axios.post(`/address/add/${user._id}`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAddresses();
      Alert.alert("Success", "Address added successfully!");
      return true;
    } catch (err) {
      console.error("Add address API error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to add address.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UPDATE ADDRESS
  // ==============================
  const updateAddress = async (addressData) => {
    setLoading(true);
    try {
      await axios.put(`/address/update/${addressData._id}`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAddresses();
      Alert.alert("Success", "Address updated successfully!");
      return true;
    } catch (err) {
      console.error("Update address API error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to update address.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // DELETE ADDRESS
  // ==============================
  const deleteAddress = async (addressId) => {
    setLoading(true);
    try {
      await axios.delete(`/address/delete/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchAddresses();
      Alert.alert("Success", "Address deleted successfully!");
      return true;
    } catch (err) {
      console.error("Delete address API error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to delete address.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // SET DEFAULT ADDRESS
  // ==============================
  const setDefaultAddress = async (addressId) => {
    setLoading(true);
    try {
      await axios.put(
        `/address/default/${user._id}`,
        { addressId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchAddresses();
      Alert.alert("Success", "Default address set!");
      return true;
    } catch (err) {
      console.error("Set default address API error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to set default address.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // FETCH SHIPPING PROVIDERS
  // ==============================
  const fetchShippingProviders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/shipping/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const providers = res.data.providers || [];
      setShippingProviders(providers);

      const defaultProvider = providers.find((p) => p.isDefault);
      setSelectedShippingProvider(defaultProvider || providers[0] || null);
    } catch (err) {
      console.error("Fetch shipping providers error:", err.response?.data || err.message);
      setShippingProviders([]);
      setSelectedShippingProvider(null);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // EFFECTS
  // ==============================
  useEffect(() => {
    if (user?._id) {
      fetchAddresses();
      fetchShippingProviders();
    }
  }, [user?._id]);

  return (
    <ShippingContext.Provider
      value={{
        addresses,
        selectedAddress,
        setSelectedAddress,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        shippingProviders,
        selectedShippingProvider,
        setSelectedShippingProvider,
        loading,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};
