import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  Modal, 
  Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';

// THEME
const THEME = {
  primary: '#074ec2',
  background: '#FAFAFA',
  text: '#1C1C1C',
  disabled: '#CCCCCC', // New color for disabled buttons
  disabledText: '#666666', // New color for disabled button text
};

const { width: screenWidth } = Dimensions.get('window');

const ProductDetails = ({ route, navigation }) => {
  const { product } = route.params;
  const { addToCart, itemCount, cartItems } = useCart();

  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const [isBuyNowModalVisible, setBuyNowModalVisible] = useState(false);
  const [isStockModalVisible, setStockModalVisible] = useState(false);
  const [stockModalMessage, setStockModalMessage] = useState('');
  const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);

  // Determine if the product is out of stock
  const isOutOfStock = product.stock === 0;

  if (!fontsLoaded) {
    return null;
  }

  const handleAddToCart = () => {
    if (isOutOfStock) {
      setStockModalMessage("This item is currently out of stock.");
      setStockModalVisible(true);
      return;
    }

    const itemInCart = cartItems.find(item => item.id === product.id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (currentQuantityInCart < product.stock) {
      addToCart(product);
      setSuccessToastVisible(true);
      setTimeout(() => {
        setSuccessToastVisible(false);
      }, 150);
    } else {
      setStockModalMessage(`You have reached the stock limit of ${product.stock} for this item in your cart.`);
      setStockModalVisible(true);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      setStockModalMessage("This item is currently out of stock. You cannot proceed with 'Buy Now'.");
      setStockModalVisible(true);
      return;
    }
    setBuyNowModalVisible(true);
  };

  const handleProceedToCheckout = () => {
    if (isOutOfStock) { // Double check for safety
      setStockModalMessage("This item is currently out of stock.");
      setStockModalVisible(true);
      setBuyNowModalVisible(false); // Close buy now modal
      return;
    }
    const productWithQuantity = { ...product, quantity };
    navigation.navigate('Checkout', {
      items: [productWithQuantity],
      total: parseFloat(product.price) * quantity,
    });
    setBuyNowModalVisible(false);
    setQuantity(1); // Reset quantity for next time
  };
  
  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      setStockModalMessage(`You can only purchase up to ${product.stock} items.`);
      setStockModalVisible(true);
    }
  };
  
  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color={'#FFFFFF'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View>
            <Icon name="cart-outline" size={28} color={'#FFFFFF'} />
            {itemCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{itemCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.carouselContainer}>
          <FlatList
            data={product.images}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
            )}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
          <View style={styles.indicatorContainer}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  { backgroundColor: index === activeIndex ? THEME.primary : '#C4C4C4' }
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₱ {parseFloat(product.price).toLocaleString()}</Text>

          <View style={styles.infoRowContainer}>
            <View style={styles.infoBox}>
              <Icon name="star" size={20} color="#FFC700" />
              <Text style={styles.infoText}>{product.rate} Stars</Text>
            </View>
            <View style={styles.infoBox}>
              <Icon name="package-variant-closed" size={20} color={'#EE2323'} />
              <Text style={[styles.infoText, isOutOfStock && styles.outOfStockText]}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
              </Text>
            </View>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.addToCartButton, isOutOfStock && styles.disabledButton]} 
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Icon name="cart-plus" size={22} color={isOutOfStock ? THEME.disabledText : THEME.primary} />
          <Text style={[styles.addToCartButtonText, isOutOfStock && styles.disabledButtonText]}>
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.buyNowButton, isOutOfStock && styles.disabledButton]} 
          onPress={handleBuyNow}
          disabled={isOutOfStock}
        >
          <Text style={[styles.buyNowButtonText, isOutOfStock && styles.disabledButtonText]}>
            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* QUANTITY SELECTION MODAL for BUY NOW */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isBuyNowModalVisible}
        onRequestClose={() => {
          setBuyNowModalVisible(false);
          setQuantity(1); // Reset quantity
        }}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => {
            setBuyNowModalVisible(false);
            setQuantity(1); // Reset quantity
          }}
        >
          <Pressable style={styles.modalContainer} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Quantity</Text>
            {isOutOfStock ? (
                <View style={styles.modalOutOfStockMessageContainer}>
                    <Icon name="alert-circle-outline" size={30} color={THEME.primary} />
                    <Text style={styles.modalOutOfStockMessageText}>This item is out of stock.</Text>
                </View>
            ) : (
                <>
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                            <Icon name="minus" size={24} color={THEME.primary} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                            <Icon name="plus" size={24} color={THEME.primary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalFooter}>
                        <Text style={styles.totalPriceLabel}>Total:</Text>
                        <Text style={styles.totalPriceValue}>
                            ₱ {(parseFloat(product.price) * quantity).toLocaleString()}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleProceedToCheckout}>
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* CUSTOM STOCK ALERT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isStockModalVisible}
        onRequestClose={() => setStockModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStockModalVisible(false)}>
          <Pressable style={styles.alertModalContainer} onPress={() => {}}>
            <Icon name="alert-circle-outline" size={48} color={THEME.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.alertModalTitle}>Stock Information</Text> {/* Generic title */}
            <Text style={styles.alertModalMessage}>{stockModalMessage}</Text>
            <TouchableOpacity style={styles.alertModalButton} onPress={() => setStockModalVisible(false)}>
              <Text style={styles.alertModalButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 'ADDED TO CART' SUCCESS TOAST */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSuccessToastVisible}
      >
        <View style={styles.toastOverlay}>
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>Added to Cart!</Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { flexDirection: 'row', backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, },
  headerTitle: { fontSize: 20, fontFamily: 'Rubik-Medium', color: '#FFFFFF' },
  badgeContainer: {
  position: 'absolute',
  top: -4,
  right: -6,
  backgroundColor: '#EE2323',
  borderRadius: 9,
  width: 18,
  height: 18,
  justifyContent: 'center',
  alignItems: 'center',
},

badgeText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: 'bold'
},
  scrollContentContainer: { paddingBottom: 100, },
  carouselContainer: { height: 350, backgroundColor: '#F3F4F6', },
  carouselImage: { width: screenWidth, height: '100%', },
  indicatorContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 15, width: '100%', },
  indicatorDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4, },
  detailsContainer: { paddingHorizontal: 20, paddingTop: 20 },
  productName: { fontSize: 22, fontFamily: 'Rubik-Bold', color: THEME.text, marginBottom: 8 },
  productPrice: { fontSize: 20, fontFamily: 'Rubik-Medium', color: THEME.primary, marginBottom: 16 },
  infoRowContainer: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16, },
  infoBox: { flexDirection: 'row', alignItems: 'center', },
  infoText: { marginLeft: 8, fontSize: 14, color: '#333', fontFamily: 'Rubik-Regular', },
  outOfStockText: { color: THEME.primary, fontFamily: 'Rubik-Bold' }, // Style for out of stock text
  descriptionTitle: { fontSize: 18, fontFamily: 'Rubik-Medium', color: THEME.text, marginBottom: 8, marginTop: 10, },
  descriptionText: { fontSize: 15, color: '#4A4A4A', fontFamily: 'Rubik-Regular', lineHeight: 23 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },

  addToCartButton: {
    backgroundColor: '#FFFFFF', // white
    borderWidth: 1,
    borderColor: THEME.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 15, // more rounded
    flex: 1,
    marginRight: 8,
  },

  addToCartButtonText: {
    color: '#000', // dark text
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    marginLeft: 8,
  },

  buyNowButton: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 15, // more rounded
    flex: 1,
    marginLeft: 8,
   
  },

  buyNowButtonText: {
    color: THEME.background,
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    marginLeft: 8,
  },
  // Styles for disabled buttons
  disabledButton: {
    backgroundColor: THEME.disabled,
    borderColor: THEME.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: THEME.disabledText,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
  modalContainer: { width: '85%', backgroundColor: THEME.background, borderRadius: 15, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
  modalTitle: { fontSize: 20, fontFamily: 'Rubik-Bold', color: THEME.text, marginBottom: 20, },
  modalOutOfStockMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#FDECEC', // Light red background
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  modalOutOfStockMessageText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    color: THEME.primary,
  },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25, },
  quantityButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 20, },
  quantityText: { fontSize: 22, fontFamily: 'Rubik-Bold', color: THEME.text, marginHorizontal: 25, },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EAEAEA', marginBottom: 15, },
  totalPriceLabel: { fontSize: 16, fontFamily: 'Rubik-Medium', color: '#4A4A4A', },
  totalPriceValue: { fontSize: 18, fontFamily: 'Rubik-Bold', color: THEME.primary, },
  checkoutButton: { backgroundColor: THEME.primary, width: '100%', paddingVertical: 14, borderRadius: 15, alignItems: 'center', },
  checkoutButtonText: { color: THEME.background, fontSize: 16, fontFamily: 'Rubik-SemiBold', },
  alertModalContainer: { width: '80%', backgroundColor: THEME.background, borderRadius: 15, paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
  alertModalTitle: { fontSize: 18, fontFamily: 'Rubik-Bold', color: THEME.text, marginBottom: 8, },
  alertModalMessage: { fontSize: 15, fontFamily: 'Rubik-Regular', color: '#4A4A4A', textAlign: 'center', marginBottom: 25, lineHeight: 22, },
  alertModalButton: { backgroundColor: THEME.primary, borderRadius: 10, paddingVertical: 12, width: '100%', alignItems: 'center', },
  alertModalButtonText: { color: THEME.background, fontSize: 16, fontFamily: 'Rubik-SemiBold', },

  toastOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  toastContainer: {
    backgroundColor: '#4BB543',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
  
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    textAlign: 'center',
  },
});

export default ProductDetails;