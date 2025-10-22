// screens/OrderDetails.js
import React, { useState, useEffect } from 'react'; // Import useEffect
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native'; // Import useRoute
import { useOrders } from '../context/OrderContext'; // Import useOrders

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

const OrderItemDetail = ({ item }) => (
    <View style={styles.orderItemDetailContainer}>
        <Image source={{ uri: item?.images?.[0] }} style={styles.orderItemDetailImage} />
        <View style={styles.orderItemDetailInfo}>
            <Text style={[styles.orderItemDetailName, { fontFamily: 'Rubik-SemiBold' }]} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.orderItemDetailQuantity, { fontFamily: 'Rubik-Regular' }]}>Qty: {item.quantity || 1}</Text>
            {/* Display price for individual item here */}
            <Text style={[styles.orderItemDetailPrice, { fontFamily: 'Rubik-Bold' }]}>
                {formatPrice(parseFloat(item.price) * (item.quantity || 1))}
            </Text>
        </View>
    </View>
);

const OrderDetails = () => { // No need to destructure route, use useRoute hook
    const navigation = useNavigation();
    const route = useRoute(); // Use useRoute hook to access params
    const { orderId } = route.params; // Now we expect only orderId from params

    const { orders, cancelOrder } = useOrders(); // Get orders and cancelOrder from context

    const [order, setOrder] = useState(null); // State to hold the order details
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    // === Local Toast State and Function ===
    const [isSuccessToastVisible, setSuccessToastVisible] = useState(false);
    const [successToastMessage, setSuccessToastMessage] = useState('');

    const showLocalSuccessToast = (message) => { // Renamed to avoid conflict if parent passes one
        setSuccessToastMessage(message);
        setSuccessToastVisible(true);
        setTimeout(() => setSuccessToastVisible(false), 2000);
    };
    // ======================================

    useEffect(() => {
        // Find the order from the context based on the orderId received in params
        const foundOrder = orders.find(o => o.id === orderId);
        setOrder(foundOrder);
        // If order is not found, you might want to handle this (e.g., navigate back)
        if (!foundOrder) {
            // Optionally, you could show an alert or navigate back
            // alert('Order not found!');
            // navigation.goBack();
        }
    }, [orderId, orders]); // Re-run when orderId or orders in context change

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

    const handleCancelOrderPress = () => {
        setConfirmConfig({
            title: "Cancel Order",
            message: "Are you sure you want to cancel this order? This action may not be possible if the seller has already processed it.",
            onConfirm: () => {
                cancelOrder(order.id); // Call cancelOrder from context
                showLocalSuccessToast('Order Cancelled Successfully!'); // Use local toast
                // Delay navigation slightly to allow toast to be seen
                setTimeout(() => navigation.goBack(), 500); 
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
                <Text style={[styles.headerTitle, { fontFamily: 'Rubik-Medium' }]}>Order Details</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontFamily: 'Rubik-Bold' }]}>Order Information</Text>
                    {/* <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { fontFamily: 'Rubik-Regular' }]}>Order ID:</Text>
                        <Text style={[styles.infoValue, { fontFamily: 'Rubik-SemiBold' }]}>{order.id}</Text>
                    </View> */}
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { fontFamily: 'Rubik-Regular' }]}>Status:</Text>
                        <Text style={[styles.infoValue, { fontFamily: 'Rubik-SemiBold', color: '#3498DB' }]}>{order.status}</Text>
                    </View>
                </View>

                {/* Updated Shipping Address Section based on Checkout.js structure */}
                <View style={styles.addresssection}>
                    <Text style={[styles.addresssectionTitle, { fontFamily: 'Rubik-Bold' }]}>Shipping Address</Text>
                    {order.shippingAddress ? (
                        <View style={styles.addressDisplay}>
                            <View style={styles.addressNameContainer}>
                                {/* Assuming 'name' in shippingAddress is used for the primary label like in Checkout */}
                                <Text style={styles.addressNameLabel}>Address Name: {order.shippingAddress.name || 'N/A'}</Text>
                                {/* Removed isDefault badge as it's not applicable for display in order details */}
                            </View>
                            <Text style={styles.addressInfoText}>
                                <Text style={styles.addressLabel}>Full Name:</Text> <Text>{order.shippingAddress.fullName || 'N/A'}</Text>
                            </Text>
                            <Text style={styles.addressInfoText}>
                                <Text style={styles.addressLabel}>Phone:</Text> <Text>{order.shippingAddress.phoneNumber || 'N/A'}</Text>
                            </Text>
                            <Text style={styles.addressInfoText}>
                                <Text style={styles.addressLabel}>Address:</Text> <Text>{order.shippingAddress.addressLine1 || order.shippingAddress.streetAddress || 'N/A'}</Text>
                            </Text>
                            <Text style={styles.addressInfoText}>
                                <Text style={styles.addressLabel}>City:</Text> <Text>{order.shippingAddress.city || 'N/A'}, {order.shippingAddress.postalCode || 'N/A'}</Text>
                            </Text>
                            <Text style={styles.addressInfoText}>
                                <Text style={styles.addressLabel}>Country:</Text> <Text>{order.shippingAddress.country || 'N/A'}</Text>
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.emptyAddressState}>
                            <Icon name="map-marker-off" size={40} color={'#FFFFFF'} /> {/* Changed color */}
                            <Text style={styles.emptyAddressText}>No shipping address details available.</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontFamily: 'Rubik-Bold' }]}>Payment Method</Text>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { fontFamily: 'Rubik-Regular' }]}>Method:</Text>
                        <Text style={[styles.infoValue, { fontFamily: 'Rubik-SemiBold' }]}>{order.paymentMethod || 'Cash on Delivery'}</Text>
                    </View>
                </View>
                
                {/* Shipping Provider Details */}
                {order.shippingProvider && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { fontFamily: 'Rubik-Bold' }]}>Shipping Provider</Text>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { fontFamily: 'Rubik-Regular' }]}>Provider:</Text>
                            <Text style={[styles.infoValue, { fontFamily: 'Rubik-SemiBold' }]}>{order.shippingProvider.name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { fontFamily: 'Rubik-Regular' }]}>Estimated Days:</Text>
                            <Text style={[styles.infoValue, { fontFamily: 'Rubik-SemiBold' }]}>{order.shippingProvider.estimatedDays}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { fontFamily: 'Rubik-Regular' }]}>Fee:</Text>
                            <Text style={[styles.infoValue, { fontFamily: 'Rubik-SemiBold' }]}>{formatPrice(order.shippingProvider.fee)}</Text>
                        </View>
                    </View>
                )}


                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontFamily: 'Rubik-Bold' }]}>Order Summary</Text>
                    {order.items.map(item => (
                        <OrderItemDetail key={item.id} item={item} />
                    ))}
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { fontFamily: 'Rubik-Regular' }]}>Subtotal ({order.items.length} items):</Text>
                        <Text style={[styles.summaryValue, { fontFamily: 'Rubik-SemiBold' }]}>{formatPrice(order.subtotal || order.total)}</Text>
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

                {/* Only show Cancel Order button if the order status is 'To Ship' */}
                {order.status === 'To Ship' && (
                    <TouchableOpacity style={[styles.actionButton, styles.cancelOrderDetailsButton]} onPress={handleCancelOrderPress}>
                        <Text style={[styles.buttonText, styles.cancelButtonText, { fontFamily: 'Rubik-Bold' }]}>Cancel Order</Text>
                    </TouchableOpacity>
                )}


            </ScrollView>

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

            {/* === Local Success Toast Modal === */}
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#074ec2', },
    headerTitle: { fontSize: 20, marginLeft: 16, color: '#FFFFFF' },
    scrollViewContent: { padding: 16 },
    section: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E9ECEF' },
    sectionTitle: { fontSize: 18, marginBottom: 15, color: '#343A40' },

    addresssection: { backgroundColor: '#074ec2', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E9ECEF' },
    addresssectionTitle: { fontSize: 18, marginBottom: 15, color: '#FFFFFF' },
    
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    infoLabel: { fontSize: 15, color: '#6C757D' },
    infoValue: { fontSize: 15, color: '#343A40', maxWidth: '60%', textAlign: 'right' },
    
    // START: New styles for address display to match Checkout
    addressDisplay: {
        marginTop: 5,
        
    },
    addressNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    addressNameLabel: {
        fontFamily: 'Rubik-Bold',
        fontSize: 16,
        color: '#FFFFFF', // Adjusted for address section background
        marginRight: 8,
    },
    addressInfoText: {
        fontFamily: 'Rubik-Medium',
        fontSize: 14,
        color: '#FFFFFF', // Adjusted for address section background
        lineHeight: 25,
    },
    addressLabel: {
        fontFamily: 'Rubik-Bold',
        fontSize: 16, // Slightly smaller than Checkout for consistency with infoLabel
        color: '#FFFFFF', // Adjusted for address section background
    },
    emptyAddressState: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyAddressText: {
        fontFamily: 'Rubik-Medium',
        fontSize: 16,
        color: '#FAFAFA', // Adjusted for address section background
        marginTop: 10,
    },
    // END: New styles for address display to match Checkout

    orderItemDetailContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
    orderItemDetailImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15, backgroundColor: '#EAEAEA' },
    orderItemDetailInfo: { flex: 1 },
    orderItemDetailName: { fontSize: 14, color: '#343A40' },
    orderItemDetailQuantity: { fontSize: 13, color: '#868E96', marginTop: 2 },
    orderItemDetailPrice: { fontSize: 14, color: '#495057', marginTop: 2 }, // Added price style
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F8F9FA' },
    summaryLabel: { fontSize: 15, color: '#6C757D' },
    summaryValue: { fontSize: 15, color: '#343A40' },
    totalRow: { borderTopWidth: 2, borderTopColor: '#DEE2E6', paddingTop: 12, marginTop: 8 },
    summaryTotalLabel: { fontSize: 18, color: '#212529' },
    summaryTotalValue: { fontSize: 18, color: '#074ec2' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
    emptyText: { fontSize: 17, color: '#ADB5BD' },
    // Cancel Button for OrderDetails
    cancelOrderDetailsButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        alignSelf: 'center', // Center the button
        padding: 16,
        borderWidth: 1, 
        borderColor: '#E9ECEF' 
    },
    actionButton: { // Re-using existing actionButton style for consistency
        paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8
    },
    buttonText: { fontSize: 16, alignSelf: 'center' }, // Adjusted font size
    cancelButtonText: { color: '#495057' },
    // Modal Styles (copied from ToShip.js for consistency)
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
    // Toast Styles
    toastOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    toastContainer: { backgroundColor: '#4BB543', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 25, alignItems: 'center', },
    toastText: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
});

export default OrderDetails;