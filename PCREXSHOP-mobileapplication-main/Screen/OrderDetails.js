// screens/OrderDetails.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOrders } from '../context/OrderContext';

const BASE_URL = "http://192.168.100.45:5000";

// Currency formatter
const formatPrice = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '₱0.00';
  if (Number.isInteger(num)) return `₱${num.toLocaleString()}`;
  return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Image utility
const getImageSource = (uri) => {
  const PLACEHOLDER = { uri: `${BASE_URL}/uploads/placeholder.png` };
  if (!uri || typeof uri !== 'string') return PLACEHOLDER;
  if (uri.startsWith("http") || uri.startsWith("data:image")) return { uri };
  if (uri.startsWith("/")) return { uri: `${BASE_URL}${uri}` };
  return { uri: `${BASE_URL}/${uri.replace(/\\/g, '/')}` };
};

const OrderItemDetail = ({ item, onImagePress }) => {
  const images = Array.isArray(item.images) && item.images.length
    ? item.images
    : item.image
      ? [item.image]
      : [];

  return (
    <View style={styles.orderItemDetailContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((img, idx) => (
          <TouchableOpacity key={idx} onPress={() => onImagePress(images, idx)}>
            <Image source={getImageSource(img)} style={styles.orderItemDetailImage} resizeMode="cover" />
          </TouchableOpacity>
        ))}
        {images.length === 0 && (
          <Image source={getImageSource(null)} style={styles.orderItemDetailImage} />
        )}
      </ScrollView>
      <View style={styles.orderItemDetailInfo}>
        <Text style={[styles.orderItemDetailName, { fontFamily: 'Rubik-SemiBold' }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.orderItemDetailQuantity, { fontFamily: 'Rubik-Regular' }]}>
          Qty: {item.quantity || 1}
        </Text>
        <Text style={[styles.orderItemDetailPrice, { fontFamily: 'Rubik-Bold' }]}>
          {formatPrice(parseFloat(item.price) * (item.quantity || 1))}
        </Text>
      </View>
    </View>
  );
};

const OrderDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  const { orders, cancelOrder } = useOrders();

  const [order, setOrder] = useState(null);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {} });
  const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState('');

  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [imageModalImages, setImageModalImages] = useState([]);
  const [imageModalIndex, setImageModalIndex] = useState(0);

  const showLocalSuccessToast = (message) => {
    setSuccessToastMessage(message);
    setSuccessToastVisible(true);
    setTimeout(() => setSuccessToastVisible(false), 2000);
  };

  useEffect(() => {
    const foundOrder = orders.find(o => o._id === orderId);
    setOrder(foundOrder);
  }, [orderId, orders]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: 'Rubik-Medium' }]}>Order Details</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { fontFamily: 'Rubik-Regular' }]}>Loading order details or order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = order.items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);

  const handleCancelOrderPress = () => {
    setConfirmConfig({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? This action may not be possible if the seller has already processed it.",
      onConfirm: () => {
        cancelOrder(order._id);
        showLocalSuccessToast('Order Cancelled Successfully!');
        setTimeout(() => navigation.goBack(), 500);
      }
    });
    setConfirmModalVisible(true);
  };

  const openImageModal = (images, index) => {
    setImageModalImages(images);
    setImageModalIndex(index);
    setImageModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: 'Rubik-Medium' }]}>Order Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: 'Rubik-Bold' }]}>Order Summary</Text>
          {order.items.map(item => (
            <OrderItemDetail key={item._id} item={item} onImagePress={openImageModal} />
          ))}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontFamily: 'Rubik-Regular' }]}>Subtotal ({order.items.length} items):</Text>
            <Text style={[styles.summaryValue, { fontFamily: 'Rubik-SemiBold' }]}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontFamily: 'Rubik-Regular' }]}>Shipping Fee:</Text>
            <Text style={[styles.summaryValue, { fontFamily: 'Rubik-SemiBold' }]}>{formatPrice(order.shippingFee || 0)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryTotalLabel, { fontFamily: 'Rubik-Bold' }]}>Total:</Text>
            <Text style={[styles.summaryTotalValue, { fontFamily: 'Rubik-Bold' }]}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        {order.status === 'To Ship' && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelOrderDetailsButton]} onPress={handleCancelOrderPress}>
            <Text style={[styles.buttonText, styles.cancelButtonText, { fontFamily: 'Rubik-Bold' }]}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Fullscreen Image Modal */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
        <View style={styles.imageModalOverlay}>
          <Image
            source={getImageSource(imageModalImages[imageModalIndex])}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.imageModalCloseButton} onPress={() => setImageModalVisible(false)}>
            <Icon name="close-circle" size={36} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal transparent={true} visible={isConfirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmModalVisible(false)}>
          <Pressable style={styles.alertModalContainer}>
            <Text style={[styles.alertModalTitle, { fontFamily: 'Rubik-Bold' }]}>{confirmConfig.title}</Text>
            <Text style={[styles.alertModalMessage, { fontFamily: 'Rubik-Regular' }]}>{confirmConfig.message}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalSecondaryButton]} onPress={() => setConfirmModalVisible(false)}>
                <Text style={[styles.modalButtonTextSecondary, { fontFamily: 'Rubik-Bold' }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalPrimaryButton]} onPress={() => { confirmConfig.onConfirm(); setConfirmModalVisible(false); }}>
                <Text style={[styles.modalButtonTextPrimary, { fontFamily: 'Rubik-Bold' }]}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Toast */}
      <Modal animationType="fade" transparent={true} visible={isSuccessToastVisible}>
        <View style={styles.toastOverlay}>
          <View style={styles.toastContainer}>
            <Text style={[styles.toastText, { fontFamily: 'Rubik-SemiBold' }]}>{successToastMessage}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#074ec2' },
  headerTitle: { fontSize: 20, marginLeft: 16, color: '#FFFFFF' },
  scrollViewContent: { padding: 16 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E9ECEF' },
  sectionTitle: { fontSize: 18, marginBottom: 15, color: '#343A40' },
  orderItemDetailContainer: { paddingVertical: 12 },
  orderItemDetailImage: { width: 100, height: 100, borderRadius: 8, marginRight: 12 },
  orderItemDetailInfo: { marginTop: 8 },
  orderItemDetailName: { fontSize: 14, color: '#343A40' },
  orderItemDetailQuantity: { fontSize: 13, color: '#868E96', marginTop: 2 },
  orderItemDetailPrice: { fontSize: 14, color: '#495057', marginTop: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F8F9FA' },
  summaryLabel: { fontSize: 15, color: '#6C757D' },
  summaryValue: { fontSize: 15, color: '#343A40' },
  totalRow: { borderTopWidth: 2, borderTopColor: '#DEE2E6', paddingTop: 12, marginTop: 8 },
  summaryTotalLabel: { fontSize: 18, color: '#212529' },
  summaryTotalValue: { fontSize: 18, color: '#074ec2' },
  cancelOrderDetailsButton: { width: '100%', backgroundColor: '#FFFFFF', alignSelf: 'center', padding: 16, borderWidth: 1, borderColor: '#E9ECEF', marginBottom: 16 },
  actionButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { fontSize: 16, alignSelf: 'center' },
  cancelButtonText: { color: '#495057' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  alertModalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 15, paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  alertModalTitle: { fontSize: 18, color: '#1C1C1C', marginBottom: 8, textAlign: 'center' },
  alertModalMessage: { fontSize: 15, color: '#4A4A4A', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  modalButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  modalPrimaryButton: { backgroundColor: '#074ec2', marginLeft: 8 },
  modalSecondaryButton: { backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#EAEAEA' },
  modalButtonTextPrimary: { color: 'white', fontSize: 16 },
  modalButtonTextSecondary: { color: '#1C1C1C', fontSize: 16 },
  toastOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toastContainer: { backgroundColor: '#4BB543', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, alignItems: 'center' },
  toastText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 17, color: '#ADB5BD' },
  imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, marginVertical: 20 },
  imageModalCloseButton: { position: 'absolute', top: 40, right: 20 },
});

export default OrderDetails;
