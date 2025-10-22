// context/ShippingContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

const ShippingContext = createContext();

export const useShipping = () => useContext(ShippingContext);

export const ShippingProvider = ({ children }) => {
    // Initial dummy addresses
    const [addresses, setAddresses] = useState([
        { id: '1', name: 'Home', addressLine1: '123 Main St, Apt 4B', city: 'Anytown', postalCode: '12345', country: 'USA', isDefault: true, fullName: 'Juan Dela Cruz', phoneNumber: '09123456789' },
        { id: '2', name: 'Work', addressLine1: '456 Office Rd, Suite 100', city: 'Otherville', postalCode: '67890', country: 'USA', isDefault: false, fullName: 'Maria Clara', phoneNumber: '09987654321' },
    ]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [shippingProviders, setShippingProviders] = useState([
        { id: 'standard', name: 'Standard Delivery', fee: 50.0, estimatedDays: '3-5 days' },
        { id: 'pickup', name: 'Store Pickup', fee: 0.0, estimatedDays: 'Same day' },
    ]);
    const [selectedShippingProvider, setSelectedShippingProvider] = useState(null);

    // Set initial default address on load
    useEffect(() => {
        const defaultAddr = addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
            setSelectedAddress(defaultAddr);
        } else if (addresses.length > 0) {
            setSelectedAddress(addresses[0]); // Fallback to first address if no default
            setAddresses(prev => prev.map((addr, index) => index === 0 ? { ...addr, isDefault: true } : addr));
        }
        setSelectedShippingProvider(shippingProviders[0]); // Set default shipping provider
    }, [addresses.length]); // Depend on addresses.length to re-run if addresses are added/removed

    const addAddress = (newAddress) => {
        const id = (Math.random().toString(36).substring(2, 9));
        const addressToAdd = { ...newAddress, id };

        let updatedAddresses;
        if (addressToAdd.isDefault) {
            updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
            updatedAddresses.push(addressToAdd);
        } else {
            updatedAddresses = [...addresses, addressToAdd];
        }
        setAddresses(updatedAddresses);
        if (addressToAdd.isDefault || addresses.length === 0) {
            setSelectedAddress(addressToAdd);
        }
    };

    const updateAddress = (updatedAddress) => {
        const updatedAddresses = addresses.map(addr => {
            if (addr.id === updatedAddress.id) {
                return updatedAddress;
            } else if (updatedAddress.isDefault) {
                return { ...addr, isDefault: false }; // Unset default for others if this one is default
            }
            return addr;
        });
        setAddresses(updatedAddresses);
        if (selectedAddress && selectedAddress.id === updatedAddress.id) {
            setSelectedAddress(updatedAddress);
        } else if (updatedAddress.isDefault) {
            setSelectedAddress(updatedAddress);
        }
    };

    const deleteAddress = (id) => {
        const newAddresses = addresses.filter(addr => addr.id !== id);
        setAddresses(newAddresses);
        if (selectedAddress && selectedAddress.id === id) {
            setSelectedAddress(null); // Clear selected if deleted
        }
        // If the default address was deleted, set a new default or clear
        if (newAddresses.length > 0 && !newAddresses.some(addr => addr.isDefault)) {
            const firstAddress = { ...newAddresses[0], isDefault: true };
            newAddresses[0] = firstAddress;
            setSelectedAddress(firstAddress);
        } else if (newAddresses.length === 0) {
            setSelectedAddress(null);
        }
    };

    const setDefaultAddress = (id) => {
        const updatedAddresses = addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === id,
        }));
        setAddresses(updatedAddresses);
        setSelectedAddress(updatedAddresses.find(addr => addr.id === id));
    };

    const value = {
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        selectedAddress,
        setSelectedAddress,
        shippingProviders,
        selectedShippingProvider,
        setSelectedShippingProvider,
    };

    return (
        <ShippingContext.Provider value={value}>
            {children}
        </ShippingContext.Provider>
    );
};