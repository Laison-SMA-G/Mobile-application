import React, { useMemo } from 'react'; // Removed useState from here as modal/toast/cancel logic is moved
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native'; // Removed Modal, Pressable
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
        {/* Ensure item.images[0] is valid before using */}
        <Image source={{ uri: item?.images?.[0] }} style={styles.orderItemImage} />
        <View style={styles.orderItemDetails}>
            <Text style={[styles.orderItemName, { fontFamily: 'Rubik-SemiBold' }]} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.orderItemQuantity, { fontFamily: 'Rubik-Regular' }]}>Qty: {item.quantity || 1}</Text>
        </View>
        {/* Format price consistently */}
        <Text style={[styles.orderItemPrice, { fontFamily: 'Rubik-Medium' }]}> {formatPrice(parseFloat(item.price) * (item.quantity || 1))}</Text>
    </View>
);

const OrderCard = ({ order, onViewDetails }) => ( // Removed onCancel prop
    // Use TouchableOpacity for the entire card to trigger onViewDetails
    <TouchableOpacity onPress={() => onViewDetails(order)} style={styles.card}>
        <View style={styles.cardHeader}>
            {/* <Text style={[styles.orderId, { fontFamily: 'Rubik-Regular' }]}>Order ID: {order.id}</Text> */}
            <Text style={[styles.orderStatus, { fontFamily: 'Rubik-Bold' }]}>{order.status}</Text>
        </View>
        {/* Dynamic status info based on actual order status */}
        <Text style={[styles.statusInfo, { fontFamily: 'Rubik-Regular' }]}>
            {order.status === 'To Ship' ? 'Your order is being prepared by the seller.' :
             order.status === 'To Pay' ? 'Awaiting your payment.' :
             order.status === 'Cancelled' ? 'This order has been cancelled.' :
             'Order status updated.'}
        </Text>
        {order.items.map(item => <OrderItem key={item.id} item={item} />)}
        <View style={styles.cardFooter}>
            <Text style={[styles.orderTotalLabel, { fontFamily: 'Rubik-Regular' }]}>Total:</Text>
            {/* Format price consistently */}
            <Text style={[styles.orderTotalValue, { fontFamily: 'Rubik-SemiBold' }]}>{formatPrice(order.total)}</Text>
        </View>
        {/* Removed Cancel Order button from here */}
    </TouchableOpacity>
);

const ToShip = ({ navigation }) => {
    const { orders } = useOrders(); // Removed cancelOrder from destructuring
    // Memoize the filtered orders for performance
    const toShipOrders = useMemo(() => orders.filter(o => o.status === 'To Ship'), [orders]);

    // Removed isConfirmModalVisible, confirmConfig, isSuccessToastVisible, successToastMessage, showSuccessToast, handleCancelOrder states and functions

    // === UPDATED FUNCTION TO VIEW ORDER DETAILS ===
    const handleViewOrderDetails = (order) => {
        // Pass only the orderId. The OrderDetails screen will fetch the full order.
        navigation.navigate('OrderDetails', { orderId: order.id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>To Ship</Text>
                <View style={{ width: 28 }} />
            </View>
            <FlatList
                data={toShipOrders}
                keyExtractor={(item) => item.id} // item.id here refers to the order ID
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        onViewDetails={handleViewOrderDetails}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<View style={styles.emptyContainer}><Icon name="package-variant-closed" size={70} color="#CCC" /><Text style={[styles.emptyText, { fontFamily: 'Rubik-Regular' }]}>You have no orders being shipped.</Text></View>}
            />
           
        </SafeAreaView>
    );
};

// --- STYLES (minor removals for toast icon and modal close behavior) ---
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
    // orderId: { fontSize: 13, color: '#868E96' },
    orderStatus: { fontSize: 13, color: '#3498DB' }, // Consider dynamic color for different statuses
    statusInfo: { fontSize: 13, color: '#868E96', paddingHorizontal: 14, paddingBottom: 10 },
    orderItemContainer: { flexDirection: 'row', padding: 14, borderTopWidth: 1, borderTopColor: '#F8F9FA' },
    orderItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 14, backgroundColor: '#EAEAEA' },
    orderItemDetails: { flex: 1, justifyContent: 'center' },
    orderItemName: { fontSize: 15, color: '#343A40' },
    orderItemQuantity: { fontSize: 14, color: '#868E96', marginTop: 4 },
    orderItemPrice: { fontSize: 15, color: '#495057' },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 14, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
    orderTotalLabel: { fontSize: 14, color: '#495057' },
    orderTotalValue: { fontSize: 18, marginLeft: 8, color: '#074ec2' },
    // Removed actionRow, actionButton, cancelButton, buttonText, cancelButtonText styles as they are no longer used
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 20, fontSize: 17, color: '#ADB5BD' },
   
});

export default ToShip;