// screens/ShippingAddress.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Pressable,
  StatusBar,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts } from "expo-font";
import Checkbox from "expo-checkbox";
import { useShipping } from "../context/ShippingContext";
import { useUser } from "../context/UserContext";

const ShippingAddress = ({ navigation }) => {
  const { user } = useUser();

  const [fontsLoaded] = useFonts({
    "Rubik-Regular": require("../assets/fonts/Rubik/static/Rubik-Regular.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik/static/Rubik-Bold.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik/static/Rubik-Medium.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik/static/Rubik-SemiBold.ttf"),
  });

  const {
    addresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    fetchAddresses,
    loading,
  } = useShipping();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState({
    name: "",
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });

  // Load addresses on mount
  useEffect(() => {
    if (user._id) {
      fetchAddresses();
    }
  }, [user._id]);

  const openAddModal = () => {
    setEditingAddress(null);
    setForm({
      name: "",
      fullName: "",
      phoneNumber: "",
      addressLine1: "",
      city: "",
      postalCode: "",
      country: "",
      isDefault: false,
    });
    setModalVisible(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setForm({ ...address });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const { name, fullName, phoneNumber, addressLine1, city, postalCode, country } = form;
    if (!name || !fullName || !phoneNumber || !addressLine1 || !city || !postalCode || !country) {
      return Alert.alert("Error", "Please fill in all fields.");
    }

    try {
      if (editingAddress) {
        await updateAddress(form);
        Alert.alert("Success", "Address updated!");
      } else {
        await addAddress(form);
      }
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save address.");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAddress(id) },
    ]);
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    Alert.alert("Success", "Default address updated!");
  };

  const handleSelect = (address) => {
    setSelectedAddress(address);
    Alert.alert("Selected", `${address.name} selected for checkout.`);
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Address</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="map-marker-off-outline" size={60} color="#B0B0B0" />
            <Text style={styles.noAddressText}>No shipping addresses found.</Text>
            <Text style={styles.noAddressSubText}>Tap 'Add New Address' to get started!</Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <TouchableOpacity
              key={addr._id}
              style={[styles.addressCard, selectedAddress?._id === addr._id && styles.selectedAddressCard]}
              onPress={() => handleSelect(addr)}
            >
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>{addr.name}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
                {selectedAddress?._id === addr._id && (
                  <Icon name="check-circle" size={24} color="#074ec2" style={styles.selectedIcon} />
                )}
              </View>
              <Text style={styles.addressDetail}>{addr.fullName}</Text>
              <Text style={styles.addressDetail}>{addr.phoneNumber}</Text>
              <Text style={styles.addressDetail}>{addr.addressLine1}</Text>
              <Text style={styles.addressDetail}>{`${addr.city}, ${addr.postalCode}`}</Text>
              <Text style={styles.addressDetail}>{addr.country}</Text>

              <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => openEditModal(addr)} style={styles.actionButton}>
                  <Icon name="pencil-outline" size={18} color="#074ec2" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                {!addr.isDefault && (
                  <>
                    <TouchableOpacity onPress={() => handleDelete(addr._id)} style={styles.actionButton}>
                      <Icon name="trash-can-outline" size={18} color="#FF3B30" />
                      <Text style={[styles.actionButtonText, { color: "#FF3B30" }]}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSetDefault(addr._id)} style={styles.actionButton}>
                      <Icon name="star-outline" size={18} color="#FF9500" />
                      <Text style={[styles.actionButtonText, { color: "#FF9500" }]}>Set Default</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Icon name="plus-circle-outline" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{editingAddress ? "Edit Address" : "Add New Address"}</Text>
            {Object.keys(form).map((key) => {
              if (key === "isDefault") return null;
              return (
                <TextInput
                  key={key}
                  style={styles.modalInput}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={form[key]}
                  onChangeText={(text) => setForm({ ...form, [key]: text })}
                />
              );
            })}
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={form.isDefault}
                onValueChange={(val) => setForm({ ...form, isDefault: val })}
                color={form.isDefault ? "#074ec2" : "#888"}
              />
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.secondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={handleSave}>
                <Text style={styles.primaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// Styles (reuse your previous ShippingAddress styles)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#074ec2",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontFamily: "Rubik-Medium", color: "#FFFFFF" },
  placeholderRight: { width: 38 },
  scrollContent: { padding: 18, paddingBottom: 20 },
  emptyState: { alignItems: "center", marginTop: 60 },
  noAddressText: { fontSize: 17, fontFamily: "Rubik-Medium", color: "#666", marginTop: 20 },
  noAddressSubText: { fontSize: 13, fontFamily: "Rubik-Regular", color: "#999", marginTop: 5 },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  selectedAddressCard: { borderColor: "#074ec2", backgroundColor: "#E6F0FA" },
  addressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  addressName: { fontSize: 18, fontFamily: "Rubik-SemiBold" },
  defaultBadge: { backgroundColor: "#28CD41", borderRadius: 6, padding: 4, marginLeft: 5 },
  defaultBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Rubik-Bold" },
  selectedIcon: { marginLeft: "auto" },
  addressDetail: { fontSize: 14, fontFamily: "Rubik-Regular", color: "#555", lineHeight: 22 },
  addressActions: { flexDirection: "row", marginTop: 12, flexWrap: "wrap" },
  actionButton: { flexDirection: "row", alignItems: "center", marginRight: 20, marginBottom: 8 },
  actionButtonText: { fontSize: 13, fontFamily: "Rubik-Medium", marginLeft: 6 },
  bottomContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  addButton: {
    backgroundColor: "#074ec2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
  },
  addButtonText: { color: "#fff", fontSize: 17, fontFamily: "Rubik-SemiBold", marginLeft: 10 },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { width: "88%", backgroundColor: "#fff", borderRadius: 18, padding: 25 },
  modalTitle: { fontSize: 22, fontFamily: "Rubik-Bold", marginBottom: 20, textAlign: "center" },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 13,
    marginBottom: 12,
    fontFamily: "Rubik-Regular",
  },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  checkboxLabel: { marginLeft: 10, fontSize: 14 },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  primaryButton: { backgroundColor: "#074ec2", marginLeft: 8 },
  secondaryButton: { backgroundColor: "#FAFAFA", marginRight: 8, borderWidth: 1, borderColor: "#DDD" },
  primaryText: { color: "#fff", fontSize: 16, fontFamily: "Rubik-SemiBold" },
  secondaryText: { color: "#555", fontSize: 16, fontFamily: "Rubik-SemiBold" },
});

export default ShippingAddress;
