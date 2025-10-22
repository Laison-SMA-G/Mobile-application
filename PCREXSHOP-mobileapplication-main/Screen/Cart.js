import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, Alert, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';
// import { Swipeable } from 'react-native-gesture-handler'; // Remove Swipeable import

const Cart = ({ navigation }) => {
  const { cartItems, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useCart();
  
  // State to track selected items for checkout
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false); // New state for select all

  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  // Effect to update 'selectAll' state if cartItems or selectedItems change
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.size === cartItems.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [cartItems, selectedItems]);

  // --- Currency Formatting Utility ---
const formatPrice = (value) => {
  const num = parseFloat(value);

  // Check if integer or may decimal
  if (Number.isInteger(num)) {
    return `₱${num.toLocaleString()}`;
  } else {
    return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

  // Toggle selection for an item
  const handleToggleSelection = (itemId) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };
  
  // Toggle select all items
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set()); // Deselect all
    } else {
      const allItemIds = new Set(cartItems.map(item => item.id));
      setSelectedItems(allItemIds); // Select all
    }
    setSelectAll(!selectAll);
  };

  // Calculate total price and count ONLY for selected items
  const { selectedTotalPrice, selectedItemCount } = useMemo(() => {
    let total = 0;
    let count = 0;
    cartItems.forEach(item => {
      if (selectedItems.has(item.id)) {
        total += parseFloat(item.price) * item.quantity;
        count += item.quantity;
      }
    });
    return { selectedTotalPrice: total, selectedItemCount: count };
  }, [cartItems, selectedItems]);


  const handleProceedToCheckout = () => {
    if (selectedItems.size === 0) {
      Alert.alert("No Items Selected", "Please select items to proceed to checkout.");
      return;
    }
    const itemsToCheckout = cartItems.filter(item => selectedItems.has(item.id));
    // Pass only the selected items to the checkout screen
    navigation.navigate('Checkout', { items: itemsToCheckout }); 
  };
  
  if (!fontsLoaded) {
    return null;
  }

  // Removed renderRightActions and Swipeable

  const renderCartItem = ({ item }) => (
    // Removed Swipeable wrapper
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => handleToggleSelection(item.id)}>
          <Icon 
            name={selectedItems.has(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={selectedItems.has(item.id) ? '#22c55e' : '#9ca3af'}
            style={styles.checkbox}
          />
        </TouchableOpacity>
        <Image
            source={{ uri: item.images && item.images.length > 0 ? item.images[0] : undefined }}
            style={styles.itemImage}
        />
        <View style={styles.itemDetails}>
            <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => item.quantity === 1 ? removeFromCart(item.id) : decreaseQuantity(item.id)}
          >
            <Icon name={item.quantity === 1 ? "trash-can-outline" : "minus"} size={20} color="#E31C25" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => increaseQuantity(item.id)}
            disabled={item.quantity >= item.stock} // Disable if quantity reaches stock limit
          >
            <Icon name="plus" size={20} color="#22c55e" />
          </TouchableOpacity>
        </View>
      </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 ? (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.content}>
          <Icon name="cart-remove" size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <Text style={styles.subText}>Looks like you haven't added anything to your cart yet.</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => navigation.navigate('HomeScreen')}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Select All Option */}
          <View style={styles.selectAllContainer}>
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
              <Icon 
                name={selectAll ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={selectAll ? '#22c55e' : '#9ca3af'}
                style={styles.checkbox}
              />
              <Text style={styles.selectAllText}>Select All ({cartItems.length} items)</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContentContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total ({selectedItemCount} items):</Text>
              <Text style={styles.totalPrice}>{formatPrice(selectedTotalPrice)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, selectedItems.size === 0 && styles.checkoutButtonDisabled]} 
              onPress={handleProceedToCheckout}
              disabled={selectedItems.size === 0}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#074ec2', // White header background
    },
    headerTitle: {
        fontFamily: 'Rubik-SemiBold',
        fontSize: 18,
        color: '#FFFFFF',
    },
    clearAllButtonText: {
        fontFamily: 'Rubik-Regular',
        fontSize: 14,
        color: '#FFFFFF', // Red color for clear all
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF', // White content background for empty cart
    },
    emptyText: {
        fontFamily: 'Rubik-SemiBold',
        fontSize: 20,
        color: '#333333',
        marginTop: 15,
    },
    subText: {
        fontFamily: 'Rubik-Regular',
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: '#074ec2', // Primary blue
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10,
    },
    shopButtonText: {
        fontFamily: 'Rubik-Medium',
        fontSize: 16,
        color: '#FFFFFF',
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10, // Spacing between items
       borderWidth: 1,
       borderColor: '#eee',
    },
    checkbox: {
        marginRight: 10,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 10,
        resizeMode: 'cover',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    itemName: {
        fontFamily: 'Rubik-Medium',
        fontSize: 14,
        color: '#333333',
        marginBottom: 4,
    },
    itemPrice: {
        fontFamily: 'Rubik-SemiBold',
        fontSize: 15,
        color: '#074ec2', // Primary blue for price
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5', // Light grey background for quantity controls
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 8,
        marginLeft: 10,
    },
    quantityButton: {
        padding: 0,
    },
    quantityText: {
        fontFamily: 'Rubik-Medium',
        fontSize: 15,
        color: '#1C1C1C',
        marginHorizontal: 10,
    },
    separator: {
        height: 0, // No visible separator if padding is used on content container
    },
    footer: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingHorizontal: 15,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 5,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    totalLabel: {
        fontFamily: 'Rubik-Regular',
        fontSize: 15,
        color: '#666666',
    },
    totalPrice: {
        fontFamily: 'Rubik-Bold',
        fontSize: 18,
        color: '#074ec2',
    },
    checkoutButton: {
        backgroundColor: '#074ec2', // Primary blue
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkoutButtonDisabled: {
      backgroundColor: '#a6c6ed', // Lighter blue for disabled state
    },
    checkoutButtonText: {
        fontFamily: 'Rubik-SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
    },
    selectAllContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
      marginBottom: 10,
      borderRadius: 10,
      marginHorizontal: 15,
      marginTop: 10,
      borderWidth:1,
      borderColor: '#eee',
    },
    selectAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    selectAllText: {
      fontFamily: 'Rubik-Medium',
      fontSize: 15,
      marginLeft: 8,
      color: '#333333',
    }
});

export default Cart;