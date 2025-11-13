import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrders } from '../context/OrderContext';

const formatPrice = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '₱0.00';
  return Number.isInteger(num)
    ? `₱${num.toLocaleString()}`
    : `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const OrderItem = ({ item }) => (
  <View style={styles.orderItemContainer}>
    <Image source={{ uri: item?.images?.[0] }} style={styles.orderItemImage} />
    <View style={styles.orderItemDetails}>
      <Text style={styles.orderItemName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.orderItemQuantity}>Qty: {item.quantity || 1}</Text>
    </View>
    <Text style={styles.orderItemPrice}>{formatPrice(item.price * (item.quantity || 1))}</Text>
  </View>
);

const OrderCard = ({ order, onReview }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.orderStatus}>{order.status}</Text>
    </View>
    {order.items.map(item => <OrderItem key={item._id} item={item} />)}
    <View style={styles.cardFooter}>
      <TouchableOpacity style={styles.actionButton} onPress={onReview}>
        <Text style={styles.buttonText}>Mark as Completed</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ToReview = ({ navigation }) => {
  const { orders, updateOrderStatus } = useOrders();
  const toReviewOrders = useMemo(() => orders.filter(o => o.status === 'To Review'), [orders]);

  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {} });

  const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState('');

  const showSuccessToast = (message) => {
    setSuccessToastMessage(message);
    setSuccessToastVisible(true);
    setTimeout(() => setSuccessToastVisible(false), 2000);
  };

  const handleReviewOrder = (_id) => {
    setConfirmConfig({
      title: "Rate Product",
      message: "This will mark the order as 'Completed'.",
      onConfirm: () => {
        updateOrderStatus(_id, 'Completed');
        showSuccessToast('Order Completed!');
      }
    });
    setConfirmModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To Review</Text>
        <View style={{ width: 28 }} />
      </View>
      <FlatList
        data={toReviewOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OrderCard order={item} onReview={() => handleReviewOrder(item._id)} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="star-half-full" size={70} color="#CCC" />
            <Text style={styles.emptyText}>No orders to review.</Text>
          </View>
        }
      />

      {/* Confirmation Modal */}
      <Modal transparent visible={isConfirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setConfirmModalVisible(false)}>
          <Pressable style={styles.alertModalContainer}>
            <Text style={styles.alertModalTitle}>{confirmConfig.title}</Text>
            <Text style={styles.alertModalMessage}>{confirmConfig.message}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalSecondaryButton]} onPress={() => setConfirmModalVisible(false)}>
                <Text style={styles.modalButtonTextSecondary}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalPrimaryButton]} onPress={() => { confirmConfig.onConfirm(); setConfirmModalVisible(false); }}>
                <Text style={styles.modalButtonTextPrimary}>Mark as Completed</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Toast */}
      <Modal transparent visible={isSuccessToastVisible} animationType="fade">
        <View style={styles.toastOverlay}>
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{successToastMessage}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#074ec2' },
  headerTitle: { fontSize: 20, color: '#FFF' },
  listContainer: { padding: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  orderStatus: { fontSize: 13, color: '#9B59B6' },
  orderItemContainer: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
  orderItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 14, backgroundColor: '#EAEAEA' },
  orderItemDetails: { flex: 1, justifyContent: 'center' },
  orderItemName: { fontSize: 15, color: '#343A40' },
  orderItemQuantity: { fontSize: 14, color: '#868E96', marginTop: 4 },
  orderItemPrice: { fontSize: 15, color: '#495057' },
  cardFooter: { padding: 10, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F3F5' },
  actionButton: { backgroundColor: '#074ec2', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: '#FFF', fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 20, fontSize: 17, color: '#ADB5BD' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  alertModalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 15, paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  alertModalTitle: { fontSize: 18, marginBottom: 8, textAlign: 'center' },
  alertModalMessage: { fontSize: 15, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  modalButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  modalPrimaryButton: { backgroundColor: '#074ec2', marginLeft: 8 },
  modalSecondaryButton: { backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#EAEAEA' },
  modalButtonTextPrimary: { color: '#FFF', fontSize: 16 },
  modalButtonTextSecondary: { color: '#1C1C1C', fontSize: 16 },
  toastOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toastContainer: { backgroundColor: '#4BB543', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, alignItems: 'center' },
  toastText: { color: '#FFF', fontSize: 16 },
});

export default ToReview;
