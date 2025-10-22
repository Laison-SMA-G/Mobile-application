import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';


const THEME = {
  COLORS: {
    primary: '#074ec2',
    text: '#1C1C1C',
    background: '#FAF5F1',
    card: '#FFFFFF',
    placeholder: '#F0F0F0',
    // Add a color for the best seller badge
    bestSellerBadge: '#FFD700', // Gold color
    bestSellerText: '#1C1C1C',  // Dark text for contrast
  },
};

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

const ProductCard = ({ product, onPress }) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  const { addToCart, cartItems } = useCart();
  const [isStockModalVisible, setStockModalVisible] = useState(false);
  const [stockModalMessage, setStockModalMessage] = useState('');
  const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 0,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleAddToCart = () => {
    const itemInCart = cartItems.find(item => item.id === product.id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (product.stock === 0) {
      setStockModalMessage("This item is currently out of stock.");
      setStockModalVisible(true);
      return;
    }

    if (currentQuantityInCart < product.stock) {
      addToCart(product);
      setSuccessToastVisible(true);
      setTimeout(() => {
        setSuccessToastVisible(false);
      }, 5000);
    } else {
      setStockModalMessage(`You have reached the stock limit of ${product.stock} for this item in your cart.`);
      setStockModalVisible(true);
    }
  };

  if (!fontsLoaded) {
    return null; 
  }


  const isOutOfStock = product.stock === 0;

  return (
    <>
      <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
          <View style={styles.imageContainer}>
            <Animated.Image 
              source={{ uri: product.images[0] }} 
              style={styles.image}
              resizeMode='cover'
            />
         
            {isOutOfStock && (
                <View style={styles.outOfStockOverlay}>
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                </View>
            )}
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.textSection}>
              <View style={styles.titleRow}>
                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={15} color="#FFC700" />
                  <Text style={styles.ratingText}>({product.rate})</Text>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.price}>{formatPrice(product.price)}</Text>
              <TouchableOpacity 
                style={[styles.addToCartButton, isOutOfStock && styles.addToCartButtonDisabled]}
                onPress={handleAddToCart}
                disabled={isOutOfStock}
              >
                <Icon name="cart-plus" size={20} color={THEME.COLORS.card} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modals for stock limit and success toast */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isStockModalVisible}
        onRequestClose={() => setStockModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStockModalVisible(false)}>
          <Pressable style={styles.alertModalContainer}>
            <Icon name="cart-off" size={48} color={THEME.COLORS.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.alertModalTitle}>Stock Information</Text> {/* Changed title */}
            <Text style={styles.alertModalMessage}>{stockModalMessage}</Text>
            <TouchableOpacity style={styles.alertModalButton} onPress={() => setStockModalVisible(false)}>
              <Text style={styles.alertModalButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

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
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: 8 },
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.card,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: Platform.OS === 'android' ? 1 : 0, 
  },
  imageContainer: { 
    width: '100%', 
    height: 140, 
    backgroundColor: THEME.COLORS.placeholder,
    justifyContent: 'center', // Center content if needed
    alignItems: 'center', // Center content if needed
  },
  image: { width: '100%', height: '100%' },
  
  // === NEW STYLES FOR BEST SELLER BADGE ===
  bestSellerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    backgroundColor: THEME.COLORS.bestSellerBadge,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 1, // Ensure it's above the image
  },
  bestSellerText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: 'Rubik-SemiBold',
    color: THEME.COLORS.bestSellerText,
  },
  // === NEW STYLES FOR OUT OF STOCK OVERLAY ===
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2, // Ensure it's above the image and best seller badge
  },
  outOfStockText: {
    color: THEME.COLORS.card, // White text
    fontSize: 16,
    fontFamily: 'Rubik-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },

  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  textSection: {
    // Container for name, rating, and subtitle
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  name: {
    flex: 1,
    color: THEME.COLORS.text,
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Rubik-Regular',
    marginLeft: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Rubik-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    color: THEME.COLORS.primary,
    fontSize: 18,
    fontFamily: 'Rubik-Medium',
  },
  addToCartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#CCCCCC', // Grey out button when disabled
  },
  // === MODAL & TOAST STYLES (Minor title change for modal) ===
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  alertModalContainer: {
    width: '80%',
    backgroundColor: THEME.COLORS.card,
    borderRadius: 15,
    paddingTop: 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
  },
  alertModalTitle: { fontSize: 18, fontFamily: 'Rubik-Bold', color: THEME.COLORS.text, marginBottom: 8 },
  alertModalMessage: { fontSize: 15, fontFamily: 'Rubik-Regular', color: '#4A4A4A', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  alertModalButton: { backgroundColor: THEME.COLORS.primary, borderRadius: 10, paddingVertical: 12, width: '100%', alignItems: 'center' },
  alertModalButtonText: { color: THEME.COLORS.card, fontSize: 16, fontFamily: 'Rubik-SemiBold' },
  toastOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  toastContainer: { backgroundColor: '#4BB543', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, alignItems: 'center'},
  toastText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Rubik-Medium', textAlign: 'center' },
});

export default ProductCard;