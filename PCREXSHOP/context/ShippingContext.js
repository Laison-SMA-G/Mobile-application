// context/ShippingContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useUser } from "./UserContext";
import axios from "axios";

const isProd = true;
export const BASE_URL = isProd ? "https://mobile-application-2.onrender.com/api" : "http://192.168.0.102:5000/api";

axios.defaults.baseURL = BASE_URL;

// ==============================
// MOCK DATA (acts as backend)
// ==============================
let MOCK_ADDRESSES = [
  {
    _id: "addr1",
    name: "Home",
    fullName: "Sean Michael Laison",
    phoneNumber: "+639123456789",
    addressLine1: "123 Main Street",
    city: "Manila",
    postalCode: "1000",
    country: "Philippines",
    isDefault: true,
  },
  {
    _id: "addr2",
    name: "Office",
    fullName: "Sean Michael Laison",
    phoneNumber: "+639987654321",
    addressLine1: "456 Office Rd",
    city: "Quezon City",
    postalCode: "1100",
    country: "Philippines",
    isDefault: false,
  },
];

const ShippingContext = createContext();
export const useShipping = () => useContext(ShippingContext);
const token = AsyncStorage.getItem("@token");

export const ShippingProvider = ({ children }) => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);

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

      // Call the backend API
      const res = await axios.get(
        `/address/${user._id}`, // your backend route
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userAddresses = res.data.addresses;
      setAddresses(userAddresses);

      const defaultAddr = userAddresses.find((a) => a.isDefault);
      setSelectedAddress(defaultAddr || userAddresses[0] || null);
    } catch (err) {
      console.error("Fetch addresses API error:", err.response?.data || err.message);
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
      // Call the backend API
      const res = await axios.post(
        `/address/add/${user._id}`, // your backend route
        addressData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newAddress = res.data.address; // backend should return the saved address

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
      await new Promise((res) => setTimeout(res, 500));

      MOCK_ADDRESSES = MOCK_ADDRESSES.map((a) => (a._id === addressData._id ? { ...addressData } : a));

      if (addressData.isDefault) {
        MOCK_ADDRESSES = MOCK_ADDRESSES.map((a) => (a._id !== addressData._id ? { ...a, isDefault: false } : a));
        setSelectedAddress(addressData);
      }

      setAddresses([...MOCK_ADDRESSES]);
      Alert.alert("Success", "Address updated successfully!");
      return true;
    } catch (err) {
      Alert.alert("Error", "Failed to update address (mock).");
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
      await new Promise((res) => setTimeout(res, 500));

      MOCK_ADDRESSES = MOCK_ADDRESSES.filter((a) => a._id !== addressId);
      setAddresses([...MOCK_ADDRESSES]);

      if (selectedAddress?._id === addressId) {
        const defaultAddr = MOCK_ADDRESSES.find((a) => a.isDefault);
        setSelectedAddress(defaultAddr || MOCK_ADDRESSES[0] || null);
      }

      Alert.alert("Success", "Address deleted successfully!");
      return true;
    } catch (err) {
      Alert.alert("Error", "Failed to delete address (mock).");
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
      await new Promise((res) => setTimeout(res, 500));

      MOCK_ADDRESSES = MOCK_ADDRESSES.map((a) => ({
        ...a,
        isDefault: a._id === addressId,
      }));

      const newDefault = MOCK_ADDRESSES.find((a) => a._id === addressId);
      setSelectedAddress(newDefault);
      setAddresses([...MOCK_ADDRESSES]);

      Alert.alert("Success", "Default address set!");
      return true;
    } catch (err) {
      Alert.alert("Error", "Failed to set default address (mock).");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchAddresses();
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
        loading,
      }}
    >
      {children}
    </ShippingContext.Provider>
  );
};
