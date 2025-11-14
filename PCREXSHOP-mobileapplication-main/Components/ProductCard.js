// ProductCard.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useCart } from "../context/CartContext";
import { useFonts } from "expo-font";
import { getImageUri } from "../utils/getImageUri";

const THEME = {
  COLORS: { primary: "#074ec2", text: "#1C1C1C", card: "#FFFFFF", placeholder: "#F0F0F0" },
};

const formatPrice = (value) => {
  const num = parseFloat(value);
  if (Number.isInteger(num)) return `₱${num.toLocaleString()}`;
  return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ProductCard = ({ product, onPress }) => {
  const [fontsLoaded] = useFonts({
    "Rubik-Regular": require("../assets/fonts/Rubik/static/Rubik-Regular.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik/static/Rubik-Bold.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik/static/Rubik-Medium.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik/static/Rubik-SemiBold.ttf"),
  });

  const { addToCart, cartItems } = useCart();
  const [isStockModalVisible, setStockModalVisible] = useState(false);
  const [stockModalMessage, setStockModalMessage] = useState("");
  const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const [isGalleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Ensure images array always exists, fallback to local placeholder
  const images = product.images && product.images.length
    ? product.images
    : [product.image || null];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  }, []);

  if (!fontsLoaded) return null;

  const actualStock = product.stock ?? product.quantity ?? 0;
  const isOutOfStock = actualStock === 0;

  const handleAddToCart = () => {
    const itemInCart = cartItems.find(item => item._id === product._id || item.id === product.id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (isOutOfStock) {
      setStockModalMessage("This item is currently out of stock.");
      setStockModalVisible(true);
      return;
    }

    if (currentQuantityInCart < actualStock) {
      addToCart({ ...product, quantity: 1 });
      setSuccessToastVisible(true);
      setTimeout(() => setSuccessToastVisible(false), 3000);
    } else {
      setStockModalMessage(`You have reached the stock limit of ${actualStock} for this item.`);
      setStockModalVisible(true);
    }
  };

  const openGallery = (index) => {
    setGalleryIndex(index);
    setGalleryVisible(true);
  };

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  return (
    <>
      <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((img, idx) => (
              <TouchableOpacity key={idx} onPress={() => openGallery(idx)}>
                <Image source={getImageUri(img)} style={styles.image} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.infoContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={2}>{product.name || "Unnamed Product"}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={15} color="#FFC700" />
                <Text style={styles.ratingText}>({product.rate || 0})</Text>
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

          {isOutOfStock && <View style={styles.outOfStockOverlay}><Text style={styles.outOfStockText}>Out of Stock</Text></View>}
        </TouchableOpacity>
      </Animated.View>

      {/* Stock Modal */}
      <Modal visible={isStockModalVisible} transparent animationType="fade" onRequestClose={() => setStockModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setStockModalVisible(false)}>
          <Pressable style={styles.alertModalContainer}>
            <Icon name="cart-off" size={48} color={THEME.COLORS.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.alertModalTitle}>Stock Information</Text>
            <Text style={styles.alertModalMessage}>{stockModalMessage}</Text>
            <TouchableOpacity style={styles.alertModalButton} onPress={() => setStockModalVisible(false)}>
              <Text style={styles.alertModalButtonText}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Toast */}
      <Modal visible={isSuccessToastVisible} transparent animationType="fade">
        <View style={styles.toastOverlay}>
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>Added to Cart!</Text>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Gallery */}
      <Modal visible={isGalleryVisible} transparent animationType="fade">
        <View style={styles.galleryOverlay}>
          <ScrollView
            horizontal
            pagingEnabled
            contentOffset={{ x: SCREEN_WIDTH * galleryIndex, y: 0 }}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((img, idx) => (
              <Image key={idx} source={getImageUri(img)} style={[styles.fullscreenImage, { width: SCREEN_WIDTH }]} resizeMode="contain" />
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.galleryCloseButton} onPress={() => setGalleryVisible(false)}>
            <Icon name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, margin: 8 },
  container: { flex: 1, backgroundColor: THEME.COLORS.card, borderRadius: 15, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 1, elevation: Platform.OS === "android" ? 1 : 0 },
  image: { width: 100, height: 100, borderRadius: 8, marginRight: 8 },
  outOfStockOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  outOfStockText: { color: THEME.COLORS.card, fontSize: 16, fontFamily: "Rubik-Bold" },
  infoContainer: { flex: 1, padding: 12, justifyContent: "space-between" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  name: { flex: 1, color: THEME.COLORS.text, fontSize: 14, fontFamily: "Rubik-Medium", marginRight: 8 },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 13, color: "#888", fontFamily: "Rubik-Regular", marginLeft: 4 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  price: { color: THEME.COLORS.primary, fontSize: 18, fontFamily: "Rubik-Medium" },
  addToCartButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.COLORS.primary, justifyContent: "center", alignItems: "center", elevation: 2 },
  addToCartButtonDisabled: { backgroundColor: "#CCCCCC" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  alertModalContainer: { width: "80%", backgroundColor: THEME.COLORS.card, borderRadius: 15, paddingVertical: 25, paddingHorizontal: 20, alignItems: "center", elevation: 5 },
  alertModalTitle: { fontSize: 18, fontFamily: "Rubik-Bold", color: THEME.COLORS.text, marginBottom: 8 },
  alertModalMessage: { fontSize: 15, fontFamily: "Rubik-Regular", color: "#4A4A4A", textAlign: "center", marginBottom: 25, lineHeight: 22 },
  alertModalButton: { backgroundColor: THEME.COLORS.primary, borderRadius: 10, paddingVertical: 12, width: "100%", alignItems: "center" },
  alertModalButtonText: { color: THEME.COLORS.card, fontSize: 16, fontFamily: "Rubik-SemiBold" },
  toastOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  toastContainer: { backgroundColor: "#4BB543", borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, alignItems: "center" },
  toastText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Rubik-Medium", textAlign: "center" },
  galleryOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  fullscreenImage: { height: Dimensions.get("window").width, resizeMode: "contain", marginVertical: 20 },
  galleryCloseButton: { position: "absolute", top: 40, right: 20 },
});

export default ProductCard;
