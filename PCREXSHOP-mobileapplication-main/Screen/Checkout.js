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

// THEME (remains the same, with slight additions/adjustments for modern look)
const THEME = {
  primary: '#074ec2', // Primary Blue
  secondary: '#FF9500', // Accent Orange for some highlights if needed
  background: '#FAFAFA', // Light grey background for the entire screen (changed from FFFFFF)
  cardBackground: '#FFFFFF', // White for cards
  headerText: '#FFFFFF',
  text: '#1C1C1C', // Dark text
  textAddress: '#FFFFFF', // Text color for shipping address card
  subText: '#FAFAFA', // Used in empty address state (changed from subText to lighter color for better contrast)
  subCircle: '#bdbdbdff', // For unselected radio buttons
  borderColor: '#E0E0E0', // Light border
  success: '#28CD41', // Green for success
  warning: '#FFC107', // Yellow for warning
  error: '#FF3B30', // Red for error halatanhg ai
  lightBlue: '#E6F0FA', // Lighter blue for selected states
};

const Checkout = ({ route, navigation }) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  const { cartItems, decreaseStock } = useCart(); // Destructure decreaseStock, assuming it removes items and updates stock
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

  const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to COD

  // State for Modals
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false);
  const [showIncompleteAddressModal, setShowIncompleteAddressModal] = useState(false);
  const [showEmptyOrderModal, setShowEmptyOrderModal] = useState(false);
  const [showPaymentMethodRequiredModal, setShowPaymentMethodRequiredModal] = useState(false);
  const [showShippingRequiredModal, setShowShippingRequiredModal] = useState(false);


  // Totals
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * (item.quantity || 1),
    0
  );
  // Ensure shipping fee is only added if a provider is selected
  const finalShippingFee = selectedShippingProvider ? selectedShippingProvider.fee : 0.0;
  const total = subtotal + finalShippingFee;

  // --- Currency Formatting Utility ---
  // Moved this function inside the component or outside if it's a global utility
  const formatPrice = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '₱0.00'; // Handle non-numeric values

    return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


  // No need for useEffect to pre-select COD if useState is initialized with 'COD'
  // useEffect(() => {
  //   if (!paymentMethod) {
  //       setPaymentMethod('COD');
  //   }
  // }, [paymentMethod]);


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

    if (!paymentMethod) { // This check might be redundant if default is set
      setShowPaymentMethodRequiredModal(true);
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

  // ✅ Ensure product IDs are sent to backend
  const orderDetails = {
    items: checkoutItems.map(item => ({
      _id: item._id || item.id,  // use MongoDB _id if available, fallback to id
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

  // ✅ Send to backend
  placeOrder(orderDetails);

  // ✅ Decrease stock locally in cart
  decreaseStock(checkoutItems);

  // ✅ Navigate to success page
  navigation.navigate("OrderSuccess");
};


  return (
    <SafeAreaView style={styles.container}>


      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={'#FFFFFF'}></Icon>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: 'Rubik-SemiBold' }]}>Checkout</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Shipping Address */}
        <View style={[styles.card, styles.shippingAddressCard]}>
          <View style={styles.cardHeader}>
            {/* Using THEME.textAddress for consistency with text inside the card */}
            <Text style={[styles.cardTitle, { color: THEME.textAddress, fontFamily: 'Rubik-SemiBold' }]}>Shipping Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
              <Text style={[styles.editButtonText, { fontFamily: 'Rubik-Medium' }]}>Change</Text>
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.addressDisplay}>
              <View style={styles.addressNameContainer}>
                <Text style={[styles.addressNameLabel, { fontFamily: 'Rubik-SemiBold' }]}>Address Name: {selectedAddress.name}</Text>
                {selectedAddress.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={[styles.defaultBadgeText, { fontFamily: 'Rubik-Medium' }]}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={[styles.addressLabel, { fontFamily: 'Rubik-SemiBold' }]}>Full Name:</Text> {selectedAddress.fullName}
              </Text>
              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={[styles.addressLabel, { fontFamily: 'Rubik-SemiBold' }]}>Phone:</Text> {selectedAddress.phoneNumber}
              </Text>
              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={[styles.addressLabel, { fontFamily: 'Rubik-SemiBold' }]}>Address:</Text> {selectedAddress.addressLine1}
              </Text>
              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={[styles.addressLabel, { fontFamily: 'Rubik-SemiBold' }]}>City:</Text> {selectedAddress.city}, {selectedAddress.postalCode} {/* Corrected 'postalCODe' */}
              </Text>
              <Text style={[styles.addressInfoText, { fontFamily: 'Rubik-Medium' }]}>
                <Text style={[styles.addressLabel, { fontFamily: 'Rubik-SemiBold' }]}>Country:</Text> {selectedAddress.country}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyAddressState}>
              <Icon name="map-marker-off" size={40} color={THEME.subCircle} /> {/* Changed color for better visibility */}
              <Text style={[styles.emptyAddressText, { fontFamily: 'Rubik-Medium' }]}>No address selected.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
                <Text style={[styles.addAddressPrompt, { fontFamily: 'Rubik-Medium' }]}>Tap to add/select an address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Shipping Provider */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: 'Rubik-SemiBold' }]}>Shipping Method</Text>
          <View style={styles.shippingProviderContainer}>
            {shippingProviders.map(provider => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerOption,
                  selectedShippingProvider?.id === provider.id && styles.selectedProviderOption,
                ]}
                onPress={() => setSelectedShippingProvider(provider)}
              >
                <Icon
                  name={selectedShippingProvider?.id === provider.id ? 'check-circle' : 'circle-outline'}
                  size={22}
                  color={selectedShippingProvider?.id === provider.id ? THEME.primary : THEME.subCircle}
                  style={styles.providerRadioIcon}
                />
                <View style={styles.providerDetails}>
                  <Text style={[styles.providerName, { fontFamily: 'Rubik-Medium' }]}>{provider.name}</Text>
                  <Text style={[styles.providerEst, { fontFamily: 'Rubik-Regular' }]}>{provider.estimatedDays}</Text>
                </View>
                <Text style={[styles.providerFee, { fontFamily: 'Rubik-SemiBold' }]}>
                  {formatPrice(provider.fee)}
                </Text>
              </TouchableOpacity>
            ))}
            {shippingProviders.length === 0 && (
                <Text style={[styles.emptyProviderText, { fontFamily: 'Rubik-Regular' }]}>No shipping methods available.</Text>
            )}
          </View>
        </View>

        {/* Payment Method */}
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
              <Text style={[styles.paymentOptionText, { fontFamily: 'Rubik-Medium' }]}>Cash on Delivery</Text>
              <Image source={require('../assets/cash-on-delivery.png')} style={styles.paymentIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'GCASH' && styles.selectedPaymentOption,
              ]}
              onPress={() => setPaymentMethod('GCASH')}
            >
              <Icon
                name={paymentMethod === 'GCASH' ? 'radiobox-marked' : 'radiobox-blank'}
                size={22}
                color={paymentMethod === 'GCASH' ? THEME.primary : THEME.subCircle}
              />
              <Text style={[styles.paymentOptionText, { fontFamily: 'Rubik-Medium' }]}>GCash</Text>
              <Image source={require('../assets/Gcash-logo.png')} style={styles.paymentIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: 'Rubik-SemiBold' }]}>Order Summary</Text>
          {checkoutItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.itemContainer}>
              {/* Ensure item.images[0] is valid before using */}
              <Image source={{ uri: item.images?.[0] }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { fontFamily: 'Rubik-Medium' }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQuantity, { fontFamily: 'Rubik-Regular' }]}>Qty: {item.quantity || 1}</Text>
              </View>
              <Text style={[styles.itemPrice, { fontFamily: 'Rubik-SemiBold' }]}>
                {formatPrice(item.price)}
              </Text>
            </View>
          ))}
          {checkoutItems.length === 0 && (
            <Text style={[styles.emptyOrderSummaryText, { fontFamily: 'Rubik-Regular' }]}>No items in order summary.</Text>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { fontFamily: 'Rubik-SemiBold' }]}>Payment Details</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontFamily: 'Rubik-Regular' }]}>Subtotal</Text>
            <Text style={[styles.priceValue, { fontFamily: 'Rubik-Medium' }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontFamily: 'Rubik-Regular' }]}>Shipping Fee ({selectedShippingProvider?.name || 'No Shipping'})</Text>
            <Text style={[styles.priceValue, { fontFamily: 'Rubik-Medium' }]}>
              {formatPrice(finalShippingFee)} {/* Directly use finalShippingFee */}
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
          <Text style={[styles.placeOrderButtonText, { fontFamily: 'Rubik-SemiBold' }]}>Place Order</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Modals */}
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
            navigation.navigate('ShippingAddress'); // Navigate to shipping address screen
        }}
        type="error"
        confirmText="Select Address"
        cancelText={null}
      />

      <CustomAlertModal
        isVisible={showPaymentMethodRequiredModal}
        title="Payment Method Required"
        message="Please select a payment method to proceed."
        onConfirm={() => setShowPaymentMethodRequiredModal(false)}
        type="error"
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
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#074ec2',
    
   },
  headerTitle: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 18,
    color: THEME.headerText,
  },
  scrollContent: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: THEME.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
   borderWidth:1,
   borderColor: '#eee',
  },
  shippingAddressCard: {
   backgroundColor: THEME.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 16,
    color: THEME.text, // Default text color
  },
  editButtonText: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: THEME.textAddress, // Color for "Change" button in shipping address card
  },
  addressDisplay: {
    marginTop: 5,
  },
  addressNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  addressNameLabel: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 16,
    color: THEME.textAddress,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: THEME.textAddress, // Badge background (white)
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  defaultBadgeText: {
    fontFamily: 'Rubik-Medium',
    fontSize: 10,
    color: THEME.primary, // Text color for the badge (blue)
  },
  addressInfoText: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: THEME.subText, // Lighter text for address details
    lineHeight: 25,
  },
  addressLabel: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 16,
    color: THEME.textAddress, // Make labels slightly darker for contrast against lighter subText
  },
  emptyAddressState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyAddressText: {
    fontFamily: 'Rubik-Medium',
    fontSize: 16,
    color: THEME.subText, // Lighter text for empty state
    marginTop: 10,
  },
  addAddressPrompt: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: THEME.primary,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  shippingProviderContainer: {
    marginTop: 10,
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background, // A slightly different background for options
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.borderColor,
  },
  selectedProviderOption: {
    borderColor: THEME.primary,
    backgroundColor: THEME.lightBlue,
  },
  providerRadioIcon: {
    marginRight: 10,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: THEME.text,
  },
  providerEst: {
    fontFamily: 'Rubik-Regular',
    fontSize: 12,
    color: THEME.text,
    marginTop: 2,
  },
  providerFee: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 15,
    color: THEME.primary,
  },
  emptyProviderText: { // Added style for empty shipping providers
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    color: '#868E96',
    textAlign: 'center',
    paddingVertical: 10,
  },
  paymentMethodOptions: {
    marginTop: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.borderColor,
  },
  selectedPaymentOption: {
    borderColor: THEME.primary,
    backgroundColor: THEME.lightBlue,
  },
  paymentOptionText: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: THEME.text,
    flex: 1, // Take up available space
    marginLeft: 10,
  },
  paymentIcon: {
    width: 30, // Adjust size as needed
    height: 30,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderColor,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
    backgroundColor: '#EAEAEA', // Placeholder background
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: THEME.text,
    marginBottom: 2,
  },
  itemQuantity: {
    fontFamily: 'Rubik-Regular',
    fontSize: 12,
    color: THEME.text,
  },
  itemPrice: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 14,
    color: THEME.primary,
  },
  emptyOrderSummaryText: { // Added style for empty order summary
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    color: '#868E96',
    textAlign: 'center',
    paddingVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.borderColor,
  },
  priceLabel: {
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    color: THEME.text,
  },
  priceValue: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: THEME.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 5,
  },
  totalLabel: {
    fontFamily: 'Rubik-Medium',
    fontSize: 16,
    color: THEME.text,
  },
  totalValue: {
    fontFamily: 'Rubik-Bold',
    fontSize: 16,
    color: THEME.primary,
  },
  bottomBar: {
    backgroundColor: THEME.cardBackground,
    borderTopWidth: 1,
    borderTopColor: THEME.borderColor,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  bottomPriceContainer: {
    // flex: 1, // Removed flex to let content size itself naturally
  },
  bottomTotalValue: {
    fontFamily: 'Rubik-Bold',
    fontSize: 20,
    color: THEME.primary,
    marginTop: 2,
  },
  placeOrderButton: {
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 16,
    color: THEME.cardBackground,
  },
});

export default Checkout;