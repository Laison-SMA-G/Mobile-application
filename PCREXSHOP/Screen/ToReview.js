import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useOrders } from '../context/OrderContext';
import { useUser } from '../context/UserContext';
import { getImageUri } from '../utils/getImageUri';

const ToReview = ({ navigation }) => {
    const [fontsLoaded] = useFonts({
        'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
        'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
        'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    });

    const { orders = [] } = useOrders();
    const { user, loading } = useUser();

    const toReviewOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        return orders.filter(order => order.status === 'To Review');
    }, [orders]);

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#074ec2" />
                <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Please login to view your orders.</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
        >
            <Image
                source={getImageUri(item.products?.[0]?.image)}
                style={styles.productImage}
            />
            <View style={styles.orderInfo}>
                <Text style={styles.productName}>{item.products?.[0]?.name || 'Product Name'}</Text>
                <Text style={styles.orderAmount}>Qty: {item.products?.[0]?.quantity || 1}</Text>
                <Text style={styles.orderPrice}>₱{item.total?.toFixed(2) || '0.00'}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#074ec2" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={toReviewOrders}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="message-draw" size={50} color="#888" />
                        <Text style={styles.emptyText}>No orders to review</Text>
                    </View>
                }
                contentContainerStyle={toReviewOrders.length === 0 && styles.emptyList}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, fontFamily: 'Rubik-Regular', color: '#555' },
    orderCard: { flexDirection: 'row', padding: 15, backgroundColor: '#FFF', marginHorizontal: 15, marginVertical: 8, borderRadius: 10, alignItems: 'center', elevation: 2 },
    productImage: { width: 70, height: 70, borderRadius: 8, marginRight: 15 },
    orderInfo: { flex: 1 },
    productName: { fontFamily: 'Rubik-Medium', fontSize: 14, color: '#1C1C1C', marginBottom: 4 },
    orderAmount: { fontFamily: 'Rubik-Regular', fontSize: 12, color: '#555', marginBottom: 2 },
    orderPrice: { fontFamily: 'Rubik-SemiBold', fontSize: 14, color: '#074ec2' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#888', fontFamily: 'Rubik-Medium', marginTop: 12 },
    emptyList: { flex: 1, justifyContent: 'center' },
});

export default ToReview;
