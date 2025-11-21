// context/ShippingContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "../context/UserContext"; // <-- Using your existing UserContext!
import axios from "axios";

const ShippingContext = createContext();
export const useShipping = () => useContext(ShippingContext);

export const ShippingProvider = ({ children }) => {
    const { user } = useUser(); // <-- This is your logged-in user
    const userId = user?._id;

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [shippingProviders] = useState([
        { id: "standard", name: "Standard Delivery", fee: 50, estimatedDays: "3–5 days" },
        { id: "pickup", name: "Store Pickup", fee: 0, estimatedDays: "Same day" },
    ]);
    const [selectedShippingProvider, setSelectedShippingProvider] = useState(null);

    // --------------------------------------------------------------------
    // FETCH ADDRESSES ON LOGIN
    // --------------------------------------------------------------------
    useEffect(() => {
        if (!userId) return;

        const loadAddresses = async () => {
            try {
                const res = await axios.get(`/users/${userId}/addresses`);
                const list = res.data || [];

                setAddresses(list);

                // Auto-select default
                const defaultAddress = list.find(a => a.isDefault);
                setSelectedAddress(defaultAddress || list[0] || null);

                if (!selectedShippingProvider)
                    setSelectedShippingProvider(shippingProviders[0]);

            } catch (err) {
                console.error("Failed to load user addresses:", err.response?.data || err);
            }
        };

        loadAddresses();
    }, [userId]);

    // --------------------------------------------------------------------
    // ADD ADDRESS
    // --------------------------------------------------------------------
    const addAddress = async (newAddress) => {
        if (!userId) return;

        try {
            const res = await axios.post(`/users/${userId}/addresses`, newAddress);
            const saved = res.data;

            let updated = addresses;

            if (saved.isDefault) {
                updated = addresses.map(a => ({ ...a, isDefault: false }));
                updated = [saved, ...updated];
            } else {
                updated = [...addresses, saved];
            }

            setAddresses(updated);

            if (saved.isDefault || addresses.length === 0)
                setSelectedAddress(saved);

        } catch (err) {
            console.error("Add address failed:", err.response?.data || err);
        }
    };

    // --------------------------------------------------------------------
    // UPDATE ADDRESS
    // --------------------------------------------------------------------
    const updateAddress = async (updatedAddress) => {
        if (!userId) return;

        try {
            const res = await axios.put(
                `/users/${userId}/addresses/${updatedAddress._id}`,
                updatedAddress
            );

            const saved = res.data;

            const updated = addresses.map(a =>
                a._id === saved._id
                    ? saved
                    : saved.isDefault
                    ? { ...a, isDefault: false }
                    : a
            );

            setAddresses(updated);

            if (saved.isDefault || selectedAddress?._id === saved._id)
                setSelectedAddress(saved);

        } catch (err) {
            console.error("Update address failed:", err.response?.data || err);
        }
    };

    // --------------------------------------------------------------------
    // DELETE ADDRESS
    // --------------------------------------------------------------------
    const deleteAddress = async (id) => {
        if (!userId) return;

        try {
            await axios.delete(`/users/${userId}/addresses/${id}`);

            const filtered = addresses.filter(a => a._id !== id);
            setAddresses(filtered);

            if (selectedAddress?._id === id) {
                setSelectedAddress(filtered[0] || null);
            }

            // Assign default if none left
            if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
                filtered[0].isDefault = true;
                setSelectedAddress(filtered[0]);
            }

        } catch (err) {
            console.error("Delete address failed:", err.response?.data || err);
        }
    };

    // --------------------------------------------------------------------
    // SET AS DEFAULT ADDRESS
    // --------------------------------------------------------------------
    const setDefaultAddress = async (id) => {
        if (!userId) return;

        try {
            await axios.patch(`/users/${userId}/addresses/default/${id}`);

            const updated = addresses.map(a => ({
                ...a,
                isDefault: a._id === id
            }));

            setAddresses(updated);
            setSelectedAddress(updated.find(a => a._id === id));

        } catch (err) {
            console.error("Set default address failed:", err.response?.data || err);
        }
    };

    return (
        <ShippingContext.Provider
            value={{
                addresses,
                selectedAddress,
                addAddress,
                updateAddress,
                deleteAddress,
                setDefaultAddress,
                setSelectedAddress,
                shippingProviders,
                selectedShippingProvider,
                setSelectedShippingProvider,
            }}
        >
            {children}
        </ShippingContext.Provider>
    );
};
