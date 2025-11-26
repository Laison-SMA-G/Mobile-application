import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import { useOrders } from "../context/OrderContext";
import { useUser } from "../context/UserContext";
import { getImageUri } from "../utils/getImageUri"; // Correct import

const ToShip = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    "Rubik-Regular": require("../assets/fonts/Rubik/static/Rubik-Regular.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik/static/Rubik-Medium.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik/static/Rubik-Bold.ttf"),
  });

  const { orders = [] } = useOrders();
  const { user, loading } = useUser();

  const toShipOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((order) => order.status === "To Ship");
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

  const renderItem = ({ item }) => {
    const product = Array.isArray(item.items) && item.items.length > 0 ? item.items[0] : null;

    // Prioritize image > first in images array > placeholder
    const imageUri =
      product?.image || (Array.isArray(product?.images) && product.images.length > 0 ? product.images[0] : null);

    const imageSource = getImageUri(imageUri); // always safe

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate("OrderDetails", { orderId: item._id })}
      >
        <Image source={imageSource} style={styles.productImage} />
        <View style={styles.orderInfo}>
          <Text style={styles.productName}>{product?.name || "Product Name"}</Text>
          <Text style={styles.orderAmount}>Qty: {product?.quantity || 1}</Text>
          <Text style={styles.orderPrice}>₱{item.total?.toFixed(2) || "0.00"}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#074ec2" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={toShipOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="truck-outline" size={50} color="#888" />
            <Text style={styles.emptyText}>No orders to ship</Text>
          </View>
        }
        contentContainerStyle={toShipOrders.length === 0 && styles.emptyList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, fontFamily: "Rubik-Regular", color: "#555" },
  orderCard: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  productImage: { width: 70, height: 70, borderRadius: 8, marginRight: 15 },
  orderInfo: { flex: 1 },
  productName: { fontFamily: "Rubik-Medium", fontSize: 14, color: "#1C1C1C", marginBottom: 4 },
  orderAmount: { fontFamily: "Rubik-Regular", fontSize: 12, color: "#555", marginBottom: 2 },
  orderPrice: { fontFamily: "Rubik-SemiBold", fontSize: 14, color: "#074ec2" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  emptyText: { fontSize: 16, color: "#888", fontFamily: "Rubik-Medium", marginTop: 12 },
  emptyList: { flex: 1, justifyContent: "center" },
});

export default ToShip;
