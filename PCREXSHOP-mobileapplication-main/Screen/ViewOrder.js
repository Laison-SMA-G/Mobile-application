import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

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


const statusStyles = {
    'To Pay': { color: '#FFA500', icon: 'wallet-outline' },
    'To Ship': { color: '#3498DB', icon: 'package-variant-closed' },
    'To Receive': { color: '#2ECC71', icon: 'truck-delivery-outline' },
    'To Review': { color: '#9B59B6', icon: 'star-half-full' },
    'Completed': { color: '#7F8C8D', icon: 'check-circle-outline' },
    'Cancelled': { color: '#E74C3C', icon: 'close-circle-outline' },
};


const OrderItem = ({ item }) => (
    <View style={styles.orderItemContainer}>
        <Image source={{ uri: item?.images?.[0] }} style={styles.orderItemImage} />
        <View style={styles.orderItemDetails}>
            <Text style={[styles.orderItemName, { fontFamily: 'Rubik-SemiBold' }]} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.orderItemQuantity, { fontFamily: 'Rubik-Regular' }]}>Qty: {item.quantity || 1}</Text>
        </View>
        <Text style={[styles.orderItemPrice, { fontFamily: 'Rubik-Medium' }]}> {formatPrice(parseFloat(item.price) * (item.quantity || 1))}</Text>
    </View>
);

const OrderHistoryCard = ({ order }) => {
    const statusInfo = statusStyles[order.status] || { color: '#000', icon: 'help-circle-outline' };

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
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.statusContainer]}>
                     <Icon name={statusInfo.icon} size={15} color={statusInfo.color} />
                    <Text style={[styles.orderStatus, { color: statusInfo.color, fontFamily: 'Rubik-Bold' }]}>{order.status}</Text>
                </View>
                <Text style={[styles.orderDate, { fontFamily: 'Rubik-Regular' }]}>
                    {new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
            </View>

            {order.items.map(item => <OrderItem key={item.id} item={item} />)}

            <View style={styles.cardFooter}>
                <Text style={[styles.totalLabel, { fontFamily: 'Rubik-Regular' }]}>Total:</Text>
                <Text style={[styles.totalValue, { fontFamily: 'Rubik-SemiBold' }]}>{formatPrice(order.total)}</Text>
            </View>
        </View>
    );
};


const ViewOrder = ({ navigation }) => {
    const { orders } = useOrders();
    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }, [orders]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Purchase History</Text>
                <View style={{ width: 28 }} />
            </View>
            <FlatList
                data={sortedOrders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <OrderHistoryCard order={item} />}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<View style={styles.emptyContainer}><Icon name="card-off" size={70} color="#CCC" /><Text style={[styles.emptyText, { fontFamily: 'Rubik-Regular' }]}>You have no order history yet.</Text></View>}
            />
        </SafeAreaView>
    );
};

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
    card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, borderWidth:1,borderColor: '#eee',  },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
    statusContainer: { flexDirection: 'row', alignItems: 'center' },
    orderStatus: { fontSize: 14, marginLeft: 6 }, // Applied fontFamily directly to Text
    orderDate: { fontSize: 13, color: '#868E96' }, // Applied fontFamily directly to Text
    orderItemContainer: { flexDirection: 'row', padding: 14, borderTopWidth: 1, borderTopColor: '#F8F9FA' },
    orderItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 14, backgroundColor: '#EAEAEA' },
    orderItemDetails: { flex: 1, justifyContent: 'center' },
    orderItemName: { fontSize: 15, color: '#343A40' }, // Applied fontFamily directly to Text
    orderItemQuantity: { fontSize: 14, color: '#868E96', marginTop: 4 }, // Applied fontFamily directly to Text
    orderItemPrice: { fontSize: 15, color: '#495057' }, // Applied fontFamily directly to Text
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
    totalLabel: { fontSize: 14, color: '#495057' }, // Applied fontFamily directly to Text
    totalValue: { fontSize: 18, marginLeft: 8, color: '#074ec2' }, // Applied fontFamily directly to Text
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
    emptyText: { marginTop: 20, fontSize: 17, color: '#ADB5BD' }, // Applied fontFamily directly to Text
});

export default ViewOrder;