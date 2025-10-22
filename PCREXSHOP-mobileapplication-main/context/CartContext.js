// =============================================================
// File: src/context/CartContext.js (UPDATED with Persistence)
// =============================================================

import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Create the Context
const CartContext = createContext();

const CART_STORAGE_KEY = '@MyApp:cart_v2'; // New storage key for cart

// 2. Create the Provider Component
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true); // New loading state for cart

    // Load cart items from storage
    useEffect(() => {
        const loadCartItems = async () => {
            try {
                const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (storedCart) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (e) {
                console.error('Failed to load cart items from storage.', e);
            } finally {
                setIsLoadingCart(false);
            }
        };
        loadCartItems();
    }, []);

    // Persist cart items to storage whenever cartItems changes
    useEffect(() => {
        // Only persist if not still loading initially
        if (isLoadingCart) return; 
        AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)).catch((e) =>
            console.error('Failed to save cart items to storage.', e)
        );
    }, [cartItems, isLoadingCart]); // Depend on cartItems and isLoadingCart

    /**
     * Adds a product to the cart or increments its quantity if it already exists.
     * Respects the item's stock limit.
     * @param {Object} product - The product object to add.
     */
    const addToCart = (product) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            // If item is already in the cart
            if (existingItem) {
                // Check against stock before increasing quantity
                if (existingItem.quantity < product.stock) {
                    return prevItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    // Optionally, provide feedback that stock limit is reached.
                    // This is handled in the UI for better user experience.
                    return prevItems; // Do not add if stock limit is met
                }
            }
            // If item is new, add it with quantity 1
            else {
                // Ensure the stock property is correctly passed
                return [...prevItems, { ...product, quantity: 1, stock: product.stock }];
            }
        });
    };
    
    /**
     * Increases the quantity of a specific item in the cart by one.
     * @param {String|Number} itemId - The ID of the item to increase.
     */
    const increaseQuantity = (itemId) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === itemId) {
                    // Prevent increasing past available stock
                    const newQuantity = item.quantity + 1;
                    if (newQuantity <= item.stock) {
                        return { ...item, quantity: newQuantity };
                    }
                }
                return item;
            })
        );
    };

    /**
     * Decreases the quantity of a specific item in the cart by one.
     * If quantity becomes 0, it should be removed (handled by the remove button in UI).
     * @param {String|Number} itemId - The ID of the item to decrease.
     */
    const decreaseQuantity = (itemId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };


    /**
     * Removes a specific item from the cart by its ID.
     * @param {String|Number} itemId - The unique ID of the item to remove.
     */
    const removeFromCart = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    /**
     * Clears all items from the cart.
     */
    const clearCart = () => {
        setCartItems([]);
    };

    /**
     * Decreases the stock of products that have been ordered.
     * This function simulates updating product stock based on items in the passed array.
     * In a real app, this would typically involve an API call to update your backend product stock.
     * For now, it will remove the ordered items from the cart (assuming they are "consumed").
     * @param {Array} orderedItems - An array of items that were successfully ordered.
     */
    const decreaseStock = (orderedItems) => {
        setCartItems(prevItems => {
            let newCartItems = [...prevItems];
            orderedItems.forEach(orderedItem => {
                // Remove the ordered item completely from the cart
                // Or, if you want to simulate stock reduction, you'd update
                // your *global* product list here. For simplicity, we remove it from the cart.
                newCartItems = newCartItems.filter(cartItem => cartItem.id !== orderedItem.id);
            });
            return newCartItems;
        });
        // In a real application, you'd also call an API here to update your backend product stock:
        // orderedItems.forEach(item => {
        //   updateProductStockInBackend(item.id, item.quantity); // Pseudo-function
        // });
    };


    // Calculate total price based on price * quantity
    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    }, [cartItems]);

    // Calculate total number of items (units) in the cart
    const itemCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const value = {
        cartItems,
        isLoadingCart, // Expose loading state
        addToCart,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
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

// 3. Create a Custom Hook
export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return ctx;
};