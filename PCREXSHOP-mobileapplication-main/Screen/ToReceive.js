import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useOrders } from '../context/OrderContext';

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

const OrderItem = ({ item }) => (
    <View style={styles.orderItemContainer}>
        <Image source={{ uri: item?.images?.[0] }} style={styles.orderItemImage} />
        <View style={styles.orderItemDetails}>
            <Text style={[styles.orderItemName, { fontFamily: 'Rubik-SemiBold' }]} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.orderItemQuantity, { fontFamily: 'Rubik-Regular' }]}>Qty: {item.quantity || 1}</Text>
        </View>
        <Text style={[styles.orderItemPrice, { fontFamily: 'Rubik-Bold' }]}>{formatPrice(parseFloat(item.price) * (item.quantity || 1))}</Text>
    </View>
);

const OrderCard = ({ order, onConfirm }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            {/* <Text style={[styles.orderId, { fontFamily: 'Rubik-Regular' }]}>Order ID: {order.id}</Text> */}
            <Text style={[styles.orderStatus, { fontFamily: 'Rubik-Bold' }]}>{order.status}</Text>
        </View>
        {order.items.map(item => <OrderItem key={item.id} item={item} />)}
        <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.actionButton} onPress={onConfirm}>
                <Text style={[styles.buttonText, { fontFamily: 'Rubik-Bold' }]}>Order Received</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const ToReceive = ({ navigation }) => {
    const { orders, updateOrderStatus } = useOrders();
    const toReceiveOrders = useMemo(() => orders.filter(order => order.status === 'To Receive'), [orders]);

    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    // === BAGONG STATE PARA SA SUCCESS TOAST ===
    const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);
    const [successToastMessage, setSuccessToastMessage] = useState('');

    const showSuccessToast = (message) => {
        setSuccessToastMessage(message);
        setSuccessToastVisible(true);
        setTimeout(() => setSuccessToastVisible(false), 2000);
    };

    const handleConfirmReception = (orderId) => {
        setConfirmConfig({
            title: "Confirm Receipt",
            message: "By confirming, you agree that you have received the order in good condition.",
            onConfirm: () => {
                updateOrderStatus(orderId, 'To Review');
                showSuccessToast('Order Confirmed!');
            }
        });
        setConfirmModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>To Receive</Text>
                <View style={{ width: 28 }} />
            </View>
            <FlatList
                data={toReceiveOrders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (<OrderCard order={item} onConfirm={() => handleConfirmReception(item.id)} />)}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<View style={styles.emptyContainer}><Icon name="truck-delivery-outline" size={70} color="#CCC" /><Text style={[styles.emptyText, { fontFamily: 'Rubik-Regular' }]}>No orders are on their way.</Text></View>}
            />
            <Modal transparent={true} visible={isConfirmModalVisible} onRequestClose={() => setConfirmModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setConfirmModalVisible(false)}>
                    <Pressable style={styles.alertModalContainer}>
                        
                        <Text style={[styles.alertModalTitle, { fontFamily: 'Rubik-Bold' }]}>{confirmConfig.title}</Text>
                        <Text style={[styles.alertModalMessage, { fontFamily: 'Rubik-Regular' }]}>{confirmConfig.message}</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalSecondaryButton]} onPress={() => setConfirmModalVisible(false)}>
                                <Text style={[styles.modalButtonTextSecondary, { fontFamily: 'Rubik-Bold' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalPrimaryButton]} onPress={() => { confirmConfig.onConfirm(); setConfirmModalVisible(false); }}>
                                <Text style={[styles.modalButtonTextPrimary, { fontFamily: 'Rubik-Bold' }]}>Yes, I've Received It</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* === BAGONG SUCCESS TOAST MODAL === */}
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

// --- STYLES (with new toast styles) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
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
    card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16,  borderWidth:1,borderColor: '#eee', },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
    // orderId: { fontSize: 13, color: '#868E96' }, 
    orderStatus: { fontSize: 13, color: '#2ECC71' }, // Apply fontFamily directly to Text
    orderItemContainer: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
    orderItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 14, backgroundColor: '#EAEAEA' },
    orderItemDetails: { flex: 1, justifyContent: 'center' },
    orderItemName: { fontSize: 15, color: '#343A40' }, // Apply fontFamily directly to Text
    orderItemQuantity: { fontSize: 14, color: '#868E96', marginTop: 4 }, // Apply fontFamily directly to Text
    orderItemPrice: { fontSize: 15, color: '#495057' }, // Apply fontFamily directly to Text
    cardFooter: { padding: 10, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#F1F3F5' },
    actionButton: { backgroundColor: '#074ec2', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
    buttonText: { color: '#FFF', fontSize: 14 }, // Apply fontFamily directly to Text
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 20, fontSize: 17, color: '#ADB5BD' }, // Apply fontFamily directly to Text
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    alertModalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 15, paddingTop: 25, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    alertModalTitle: { fontSize: 18, color: '#1C1C1C', marginBottom: 8, textAlign: 'center' }, // Apply fontFamily directly to Text
    alertModalMessage: { fontSize: 15, color: '#4A4A4A', textAlign: 'center', marginBottom: 25, lineHeight: 22 }, // Apply fontFamily directly to Text
    modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    modalButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    modalPrimaryButton: { backgroundColor: '#074ec2', marginLeft: 8 },
    modalSecondaryButton: { backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#EAEAEA' },
    modalButtonTextPrimary: { color: 'white', fontSize: 16 }, // Apply fontFamily directly to Text
    modalButtonTextSecondary: { color: '#1C1C1C', fontSize: 16 }, // Apply fontFamily directly to Text

    // Toast Styles
    toastOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    toastContainer: { backgroundColor: '#4BB543', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, alignItems: 'center'},
    toastText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' }, // Apply fontFamily directly to Text
});

export default ToReceive;