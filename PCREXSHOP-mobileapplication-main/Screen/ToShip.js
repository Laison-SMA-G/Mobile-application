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

const OrderCard = ({ order, onViewDetails }) => (
  <TouchableOpacity style={styles.card} onPress={() => onViewDetails(order)}>
    <View style={styles.cardHeader}>
      <Text style={styles.orderStatus}>{order.status}</Text>
    </View>
    {order.items.map(item => <OrderItem key={item._id} item={item} />)}
    <View style={styles.cardFooter}>
      <Text style={styles.orderTotalLabel}>Total:</Text>
      <Text style={styles.orderTotalValue}>{formatPrice(order.total)}</Text>
    </View>
  </TouchableOpacity>
);

const ToShip = ({ navigation }) => {
  const { orders } = useOrders();
  const toShipOrders = useMemo(() => orders.filter(o => o.status === 'To Ship'), [orders]);

  const handleViewOrderDetails = (order) => {
    navigation.navigate('OrderDetails', { orderId: order._id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To Ship</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={toShipOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OrderCard order={item} onViewDetails={handleViewOrderDetails} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package-variant-closed" size={70} color="#CCC" />
            <Text style={styles.emptyText}>You have no orders being shipped.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#074ec2' },
  headerTitle: { fontSize: 20, color: '#FFF' },
  listContainer: { padding: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  orderStatus: { fontSize: 13, color: '#3498DB' },
  orderItemContainer: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F8F9FA' },
  orderItemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 14, backgroundColor: '#EAEAEA' },
  orderItemDetails: { flex: 1, justifyContent: 'center' },
  orderItemName: { fontSize: 15, color: '#343A40' },
  orderItemQuantity: { fontSize: 14, color: '#868E96', marginTop: 4 },
  orderItemPrice: { fontSize: 15, color: '#495057' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 14, borderTopWidth: 1, borderTopColor: '#F1F3F5' },
  orderTotalLabel: { fontSize: 14, color: '#495057' },
  orderTotalValue: { fontSize: 18, marginLeft: 8, color: '#074ec2' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { marginTop: 20, fontSize: 17, color: '#ADB5BD' },
});

export default ToShip;
