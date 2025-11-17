import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrders } from '../context/OrderContext';
import { useFonts } from 'expo-font';

// --- Currency Formatting Utility ---
const formatPrice = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '₱0.00'; // Handle non-numeric values

    if (Number.isInteger(num)) {
        return `₱${num.toLocaleString()}`;
    } else {
        return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
};

// --- Reusable component to render each item in an order ---
const OrderItem = ({ item }) => (
    <View style={styles.orderItemContainer}>
        <Image source={{ uri: item?.images?.[0] }} style={styles.orderItemImage} />
        <View style={styles.orderItemDetails}>
            <Text style={[styles.orderItemName, { fontFamily: 'Rubik-SemiBold' }]} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.orderItemQuantity, { fontFamily: 'Rubik-Regular' }]}>Qty: {item.quantity || 1}</Text>
        </View>
        <Text style={[styles.orderItemPrice, { fontFamily: 'Rubik-Medium' }]}>{formatPrice(parseFloat(item.price) * (item.quantity || 1))}</Text>
    </View>
);

// --- Order Card Component with Actions ---
const OrderCard = ({ order, onPay, onCancel, onViewDetails }) => (
    <TouchableOpacity onPress={() => onViewDetails(order)} style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={[styles.orderStatus, { fontFamily: 'Rubik-Bold' }]}>{order.status}</Text>
        </View>
        <Text style={[styles.statusInfo, { fontFamily: 'Rubik-Regular' }]}>
            {order.status === 'To Pay' ? 'Awaiting your payment. Please complete payment to proceed.' : 'Order status updated.'}
        </Text>
        {order.items.map(item => <OrderItem key={item.id} item={item} />)}
        <View style={styles.cardFooter}>
            <Text style={[styles.orderTotalLabel, { fontFamily: 'Rubik-Regular' }]}>Total:</Text>
            <Text style={[styles.orderTotalValue, { fontFamily: 'Rubik-SemiBold' }]}>{formatPrice(order.total)}</Text>
        </View>
        {order.status === 'To Pay' && (
            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={(e) => { e.stopPropagation(); onCancel(); }}>
                    <Text style={[styles.buttonText, styles.cancelButtonText, { fontFamily: 'Rubik-Bold' }]}>Cancel Order</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.payButton]} onPress={(e) => { e.stopPropagation(); onPay(); }}>
                    <Text style={[styles.buttonText, styles.payButtonText, { fontFamily: 'Rubik-Bold' }]}>Pay Now</Text>
                </TouchableOpacity>
            </View>
        )}
    </TouchableOpacity>
);

const ToPay = ({ navigation }) => {
    const { orders, updateOrderStatus, cancelOrder } = useOrders();
    const toPayOrders = useMemo(() => orders.filter(o => o.status === 'To Pay'), [orders]);

    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {}, confirmText: 'Yes' });
    const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);
    const [successToastMessage, setSuccessToastMessage] = useState('');

    const showSuccessToast = (message) => {
        setSuccessToastMessage(message);
        setSuccessToastVisible(true);
        setTimeout(() => setSuccessToastVisible(false), 2000);
    };

    const handlePayment = (orderId) => {
        setConfirmConfig({
            title: "Confirm Payment",
            message: "This will simulate a successful payment and move your order to 'To Ship'. Continue?",
            confirmText: "Yes, Pay Now",
            onConfirm: () => {
                updateOrderStatus(orderId, 'To Ship');
                showSuccessToast('Payment Successful!');
            }
        });
        setConfirmModalVisible(true);
    };

    const handleCancelOrder = (orderId) => {
        setConfirmConfig({
            title: "Cancel Order",
            message: "Are you sure you want to cancel this order? This action cannot be undone.",
            confirmText: "Yes, Cancel",
            onConfirm: () => {
                cancelOrder(orderId);
                showSuccessToast('Order Cancelled');
            }
        });
        setConfirmModalVisible(true);
    };

    const handleViewOrderDetails = (order) => {
        navigation.navigate('OrderDetails', { orderId: order.id });
    };

    const [fontsLoaded] = useFonts({
        'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
        'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
        'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
        'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>For Payment</Text>
                <View style={{ width: 28 }} />
            </View>
            <FlatList
                data={toPayOrders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        onPay={() => handlePayment(item.id)}
                        onCancel={() => handleCancelOrder(item.id)}
                        onViewDetails={handleViewOrderDetails}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="wallet-outline" size={70} color="#CCC" />
                        <Text style={[styles.emptyText, { fontFamily: 'Rubik-Regular' }]}>You have no orders to pay for.</Text>
                    </View>
                }
            />
            <Modal transparent={true} visible={isConfirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setConfirmModalVisible(false)}>
                    <Pressable style={styles.alertModalContainer} onPress={(e) => e.stopPropagation()}>
                        <Text style={[styles.alertModalTitle, { fontFamily: 'Rubik-Bold' }]}>{confirmConfig.title}</Text>
                        <Text style={[styles.alertModalMessage, { fontFamily: 'Rubik-Regular' }]}>{confirmConfig.message}</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalSecondaryButton]} onPress={() => setConfirmModalVisible(false)}>
                                <Text style={[styles.modalButtonTextSecondary, { fontFamily: 'Rubik-Bold' }]}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalPrimaryButton]} onPress={() => { confirmConfig.onConfirm(); setConfirmModalVisible(false); }}>
                                <Text style={[styles.modalButtonTextPrimary, { fontFamily: 'Rubik-Bold' }]}>{confirmConfig.confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal animationType="fade" transparent={true} visible={isSuccessToastVisible}>
                <Pressable style={styles.toastOverlay} onPress={() => setSuccessToastVisible(false)}>
                    <View style={styles.toastContainer}>
                        <Text style={[styles.toastText, { fontFamily: 'Rubik-SemiBold' }]}>{successToastMessage}</Text>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

// --- STYLES (Unified styles from ToShip with ToPay specifics) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#074ec2',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Rubik-Medium',
        color: "#FFFFFF",
    },
    listContainer: { padding: 12 },
    card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee', },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 },
    // Changed orderStatus color to match 'To Pay' specific
    orderStatus: { fontSize: 13, color: '#FFA500' }, // Orange for 'To Pay' status
    statusInfo: { fontSize: 13, color: '#868E96', paddingHorizontal: 14, paddingBottom: 10 },
    orderItemContainer: { flexDirection: 'row', padding: 14, borderTopWidth: 1, borderTopColor: '#F8F9FA' },
    orderItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 14, backgroundColor: '#EAEAEA' },
    orderItemDetails: { flex: 1, justifyContent: 'center' },
    orderItemName: { fontSize: 15, color: '#343A40' },
    orderItemQuantity: { fontSize: 14, color: '#868E96', marginTop: 4 },
    orderItemPrice: { fontSize: 15, color: '#1C1C1C' }, // Keeping original price color for ToPay
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 14, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
    orderTotalLabel: { fontSize: 14, color: '#495057' },
    orderTotalValue: { fontSize: 18, marginLeft: 8, color: '#074ec2' },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F3F5', padding: 10 },
    actionButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
    cancelButton: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#EAEAEA' },
    payButton: { backgroundColor: '#074ec2' },
    buttonText: { fontSize: 14 },
    cancelButtonText: { color: '#495057' },
    payButtonText: { color: '#FFF' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 20, fontSize: 17, color: '#ADB5BD' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    alertModalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 15, paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    alertModalTitle: { fontSize: 18, color: '#1C1C1C', marginBottom: 8, textAlign: 'center' },
    alertModalMessage: { fontSize: 15, color: '#4A4A4A', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
    modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    modalButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    modalPrimaryButton: { backgroundColor: '#074ec2', marginLeft: 8 },
    modalSecondaryButton: { backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#EAEAEA' },
    modalButtonTextPrimary: { color: 'white', fontSize: 16 },
    modalButtonTextSecondary: { color: '#1C1C1C', fontSize: 16 },
    toastOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center',  },
    toastContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4BB543', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, },
    toastText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
});

export default ToPay;