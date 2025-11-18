import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useShipping } from '../context/ShippingContext';
import CustomAlertModal from '../Components/CustomAlertModal';

const THEME = {
  primary: '#074ec2',
  secondary: '#FF9500',
  background: '#FAFAFA',
  cardBackground: '#FFFFFF',
  headerText: '#FFFFFF',
  text: '#1C1C1C',
  textAddress: '#FFFFFF',
  subText: '#FAFAFA',
  subCircle: '#bdbdbdff',
  borderColor: '#E0E0E0',
  success: '#28CD41',
  warning: '#FFC107',
  error: '#FF3B30',
  lightBlue: '#E6F0FA',
};

const getImageSource = (uri) => {
  if (!uri || typeof uri !== 'string' || uri === '') {
    return { uri: 'https://via.placeholder.com/300x300.png?text=No+Image' };
  }
  return { uri };
};

const Checkout = ({ route, navigation }) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  const { cartItems, decreaseStock } = useCart();
  const { placeOrder } = useOrders();
  const {
    selectedAddress,
    shippingProviders,
    selectedShippingProvider,
    setSelectedShippingProvider,
  } = useShipping();

  const itemsFromRoute = route.params?.items;
  const isDirectBuy = !!itemsFromRoute;
  const checkoutItems = isDirectBuy ? itemsFromRoute : cartItems;

  // Only COD now
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);
  const [showIncompleteAddressModal, setShowIncompleteAddressModal] = useState(false);
  const [showEmptyOrderModal, setShowEmptyOrderModal] = useState(false);
  const [showShippingRequiredModal, setShowShippingRequiredModal] = useState(false);

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * (item.quantity || 1),
    0
  );
  const finalShippingFee = selectedShippingProvider ? selectedShippingProvider.fee : 0.0;
  const total = subtotal + finalShippingFee;

  const formatPrice = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '₱0.00';
    return `₱${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (!fontsLoaded) return null;

  const handlePlaceOrder = () => {
    if (checkoutItems.length === 0) {
      setShowEmptyOrderModal(true);
      return;
    }
    if (!selectedAddress) {
      setShowIncompleteAddressModal(true);
      return;
    }
    if (!selectedShippingProvider) {
      setShowShippingRequiredModal(true);
      return;
    }

    setShowConfirmOrderModal(true);
  };

  const confirmOrderAction = () => {
    setShowConfirmOrderModal(false);

    const orderDetails = {
      items: checkoutItems.map((item) => ({
        _id: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      shippingAddress: selectedAddress,
      paymentMethod,
      shippingProvider: selectedShippingProvider,
      subtotal,
      shippingFee: finalShippingFee,
      total,
      orderDate: new Date().toISOString(),
    };

    placeOrder(orderDetails);
    decreaseStock(checkoutItems);
    navigation.navigate('OrderSuccess');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={'#FFFFFF'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: 'Rubik-SemiBold' }]}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Shipping Address */}
        <View style={[styles.card, styles.shippingAddressCard]}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.cardTitle, { color: THEME.textAddress, fontFamily: 'Rubik-SemiBold' }]}
            >
              Shipping Address
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
              <Text style={[styles.editButtonText, { fontFamily: 'Rubik-Medium' }]}>Change</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressDisplay}>
              <View style={styles.addressNameContainer}>
                <Text style={[styles.addressNameLabel, { fontFamily: 'Rubik-SemiBold' }]}>
                  Address Name: {selectedAddress.name}
                </Text>
                {selectedAddress.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={[styles.defaultBadgeText, { fontFamily: 'Rubik-Medium' }]}>
                      DEFAULT
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={styles.addressLabel}>Full Name:</Text> {selectedAddress.fullName}
              </Text>

              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={styles.addressLabel}>Phone:</Text> {selectedAddress.phoneNumber}
              </Text>

              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={styles.addressLabel}>Address:</Text> {selectedAddress.addressLine1}
              </Text>

              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={styles.addressLabel}>City:</Text> {selectedAddress.city},{' '}
                {selectedAddress.postalCode}
              </Text>

              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={styles.addressLabel}>Country:</Text> {selectedAddress.country}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyAddressState}>
              <Icon name="map-marker-off" size={40} color={THEME.subCircle} />
              <Text style={[styles.emptyAddressText, { fontFamily: 'Rubik-Medium' }]}>
                No address selected.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
                <Text style={[styles.addAddressPrompt, { fontFamily: 'Rubik-Medium' }]}>
                  Tap to add/select an address
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Shipping Provider */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: 'Rubik-SemiBold' }]}>Shipping Method</Text>

          <View style={styles.shippingProviderContainer}>
            {shippingProviders.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerOption,
                  selectedShippingProvider?.id === provider.id &&
                    styles.selectedProviderOption,
                ]}
                onPress={() => setSelectedShippingProvider(provider)}
              >
                <Icon
                  name={
                    selectedShippingProvider?.id === provider.id
                      ? 'check-circle'
                      : 'circle-outline'
                  }
                  size={22}
                  color={
                    selectedShippingProvider?.id === provider.id
                      ? THEME.primary
                      : THEME.subCircle
                  }
                  style={styles.providerRadioIcon}
                />

                <View style={styles.providerDetails}>
                  <Text style={[styles.providerName, { fontFamily: 'Rubik-Medium' }]}>
                    {provider.name}
                  </Text>
                  <Text style={[styles.providerEst, { fontFamily: 'Rubik-Regular' }]}>
                    {provider.estimatedDays}
                  </Text>
                </View>

                <Text style={[styles.providerFee, { fontFamily: 'Rubik-SemiBold' }]}>
                  {formatPrice(provider.fee)}
                </Text>
              </TouchableOpacity>
            ))}

            {shippingProviders.length === 0 && (
              <Text style={[styles.emptyProviderText, { fontFamily: 'Rubik-Regular' }]}>
                No shipping methods available.
              </Text>
            )}
          </View>
        </View>

        {/* Payment Method (COD Only) */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: 'Rubik-SemiBold' }]}>Payment Method</Text>

          <View style={styles.paymentMethodOptions}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'COD' && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod('COD')}
            >
              <Icon
                name={paymentMethod === 'COD' ? 'radiobox-marked' : 'radiobox-blank'}
                size={22}
                color={paymentMethod === 'COD' ? THEME.primary : THEME.subCircle}
              />

              <Text style={[styles.paymentOptionText, { fontFamily: 'Rubik-Medium' }]}>
                Cash on Delivery
              </Text>

              <Image
                source={require('../assets/cash-on-delivery.png')}
                style={styles.paymentIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: 'Rubik-SemiBold' }]}>Order Summary</Text>

          {checkoutItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.itemContainer}>
              <Image source={getImageSource(item.images?.[0])} style={styles.itemImage} />

              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { fontFamily: 'Rubik-Medium' }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQuantity, { fontFamily: 'Rubik-Regular' }]}>
                  Qty: {item.quantity || 1}
                </Text>
              </View>

              <Text style={[styles.itemPrice, { fontFamily: 'Rubik-SemiBold' }]}>
                {formatPrice(item.price)}
              </Text>
            </View>
          ))}

          {checkoutItems.length === 0 && (
            <Text
              style={[styles.emptyOrderSummaryText, { fontFamily: 'Rubik-Regular' }]}
            >
              No items in order summary.
            </Text>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: 'Rubik-SemiBold' }]}>
            Payment Details
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontFamily: 'Rubik-Regular' }]}>Subtotal</Text>
            <Text style={[styles.priceValue, { fontFamily: 'Rubik-Medium' }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontFamily: 'Rubik-Regular' }]}>
              Shipping Fee ({selectedShippingProvider?.name || 'No Shipping'})
            </Text>
            <Text style={[styles.priceValue, { fontFamily: 'Rubik-Medium' }]}>
              {formatPrice(finalShippingFee)}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontFamily: 'Rubik-Medium' }]}>Total</Text>
            <Text style={[styles.totalValue, { fontFamily: 'Rubik-Bold' }]}>
              {formatPrice(total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceContainer}>
          <Text style={[styles.totalLabel, { fontFamily: 'Rubik-Medium' }]}>Total Price</Text>
          <Text style={[styles.bottomTotalValue, { fontFamily: 'Rubik-Bold' }]}>
            {formatPrice(total)}
          </Text>
        </View>

        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={[styles.placeOrderButtonText, { fontFamily: 'Rubik-SemiBold' }]}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <CustomAlertModal
        isVisible={showConfirmOrderModal}
        title="Confirm Order"
        message={`Are you sure you want to place this order?`}
        onConfirm={confirmOrderAction}
        onCancel={() => setShowConfirmOrderModal(false)}
        confirmText="Place Order"
        type="confirm"
      />

      <CustomAlertModal
        isVisible={showEmptyOrderModal}
        title="Empty Order"
        message="There are no items to check out."
        onConfirm={() => setShowEmptyOrderModal(false)}
        type="warning"
        cancelText={null}
      />

      <CustomAlertModal
        isVisible={showIncompleteAddressModal}
        title="Shipping Address Required"
        message="Please select a shipping address to proceed."
        onConfirm={() => {
          setShowIncompleteAddressModal(false);
          navigation.navigate('ShippingAddress');
        }}
        type="error"
        confirmText="Select Address"
        cancelText={null}
      />

      <CustomAlertModal
        isVisible={showShippingRequiredModal}
        title="Shipping Method Required"
        message="Please select a shipping method to proceed."
        onConfirm={() => setShowShippingRequiredModal(false)}
        type="error"
        cancelText={null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: THEME.primary,
  },
  headerTitle: { fontSize: 18, color: THEME.headerText },
  scrollContent: { paddingVertical: 15, paddingHorizontal: 15 },
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  shippingAddressCard: { backgroundColor: THEME.primary },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, color: THEME.text },
  editButtonText: { fontSize: 14, color: THEME.textAddress },
  addressDisplay: { marginTop: 5 },
  addressNameContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  addressNameLabel: { fontSize: 16, color: THEME.textAddress, marginRight: 8 },
  defaultBadge: {
    backgroundColor: THEME.textAddress,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  defaultBadgeText: { fontSize: 10, color: THEME.primary },
  addressInfoText: { fontSize: 14, color: THEME.subText, lineHeight: 25 },
  addressLabel: { fontSize: 16, color: THEME.textAddress },
  emptyAddressState: { alignItems: 'center', paddingVertical: 20 },
  emptyAddressText: { fontSize: 16, color: THEME.subText, marginTop: 10 },
  addAddressPrompt: {
    fontSize: 14,
    color: THEME.primary,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  shippingProviderContainer: { marginTop: 10 },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.borderColor,
  },
  selectedProviderOption: { borderColor: THEME.primary, backgroundColor: THEME.lightBlue },
  providerRadioIcon: { marginRight: 10 },
  providerDetails: { flex: 1 },
  providerName: { fontSize: 14, color: THEME.text },
  providerEst: { fontSize: 12, color: THEME.text, marginTop: 2 },
  providerFee: { fontSize: 15, color: THEME.text },
  emptyProviderText: { fontSize: 14, color: THEME.subCircle, textAlign: 'center', marginTop: 10 },
  paymentMethodOptions: { marginTop: 10 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.borderColor,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: THEME.background,
  },
  selectedPaymentOption: { borderColor: THEME.primary },
  paymentOptionText: { flex: 1, marginLeft: 10, fontSize: 14, color: THEME.text },
  paymentIcon: { width: 50, height: 30, resizeMode: 'contain' },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderColor,
  },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12, resizeMode: 'cover' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, color: THEME.text },
  itemQuantity: { fontSize: 12, color: THEME.subCircle, marginTop: 4 },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: THEME.text },
  emptyOrderSummaryText: { textAlign: 'center', fontSize: 14, color: THEME.subCircle, paddingVertical: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  priceLabel: { fontSize: 14, color: THEME.text },
  priceValue: { fontSize: 14, color: THEME.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  totalLabel: { fontSize: 16, color: THEME.text },
  totalValue: { fontSize: 16, color: THEME.primary },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: THEME.cardBackground,
    borderTopWidth: 1,
    borderColor: THEME.borderColor,
  },
  bottomPriceContainer: {},
  bottomTotalValue: { fontSize: 18, color: THEME.primary },
  placeOrderButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  placeOrderButtonText: { color: '#fff', fontSize: 16 },
});

export default Checkout;
