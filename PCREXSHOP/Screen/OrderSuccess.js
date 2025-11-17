import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// THEME
const THEME = {
  primary: '#074ec2',
  background: '#FFFFFF',
  text: '#1C1C1C',
  success: '#22C55E'
};

const OrderSuccess = ({ navigation }) => {

  // Function to navigate to the main home screen
  const handleGoHome = () => {
      // We use 'navigate' to go to the HomeScreen which contains the tabs
      navigation.navigate('HomeScreen');
  };

  return (
    // Pinalitan ko ang style ng container para umayos ang layout
    <SafeAreaView style={styles.container}>
      {/* --- ITO ANG IDINAGDAG NA HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoHome}>
          {/* Ginawa kong 'close' icon para mas angkop sa success screen */}
          <Icon name="chevron-left" size={28} color={THEME.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Placed</Text>
        {/* Placeholder view para ma-center ang title */}
        <View style={{ width: 28 }} />
      </View>

      {/* --- In-update ko ang style ng 'content' para mag-center ito sa natitirang space --- */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="check-decagram" size={100} color={THEME.background} />
        </View>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed successfully.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          // Dadalhin ka nito sa Purchase History screen na ginawa natin kanina
          onPress={() => navigation.navigate('ViewOrder')}
        >
          <Text style={styles.buttonText}>View My Orders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// In-update ko rin ang styles para isama ang header at ayusin ang layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    // Tinanggal ang justifyContent para hindi na ito naka-center sa buong screen
  },
  header: { // Kinuha mula sa Checkout screen
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.background,
  },
  headerTitle: { // Kinuha mula sa Checkout screen
    fontSize: 20,
    fontFamily: 'Rubik-Medium',
    color: THEME.text
  },
  content: {
    flex: 1, // Ginawang flex: 1 para sakupin ang natitirang space
    justifyContent: 'center', // Naka-center na ngayon ang content sa loob ng view na ito
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    backgroundColor: THEME.success,
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Rubik-Bold',
    color: THEME.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: THEME.background,
    fontSize: 16,
    fontFamily: 'Rubik-SemiBold',
  },
});

export default OrderSuccess;