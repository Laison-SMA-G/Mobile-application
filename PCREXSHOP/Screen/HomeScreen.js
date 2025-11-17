// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useFonts } from 'expo-font';
import BannerSlider from '../Components/BannerSlider';
import CategoryList from '../Components/CategoryList';
import BestSellerSection from '../Components/BestSellerSection';
import PreBuiltSection from '../Components/PreBuiltSection';
import ProductCard from '../Components/ProductCard';
import * as SplashScreen from 'expo-splash-screen';
import api from '../utils/axiosconfig';

SplashScreen.preventAutoHideAsync();

const THEME = {
  primary: '#074ec2',
  background: '#FAFAFA',
  text: '#1C1C1C',
  icons: '#1C1C1C',
};

// Temporary placeholder
const getImageSource = (imagePath) => {
  if (!imagePath) return require('../assets/PCREXBIGLOGOMOBILE.png'); // fallback image
  return { uri: imagePath };
};

export default function HomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  const [categories, setCategories] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [preBuiltProducts, setPreBuiltProducts] = useState([]);
  const [allProductsDisplay, setAllProductsDisplay] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const cartContext = useCart();
  const itemCount = cartContext?.itemCount || 0;
  const { user } = useUser();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const data = res.data;

        const formatted = data.map(item => {
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          let images = [];
          if (Array.isArray(item.images) && item.images.length) {
            images = item.images.map(img => getImageSource(img));
          } else if (item.image) {
            images = [getImageSource(item.image)];
          }

          const categoryObj = item.category
            ? typeof item.category === 'string'
              ? { name: item.category }
              : item.category.name
                ? item.category
                : { name: 'Unknown' }
            : { name: 'Unknown' };

          return {
            ...item,
            quantity,
            images,
            image: images[0] || getImageSource(null),
            category: categoryObj,
          };
        });

        setAllProducts(formatted);
        setAllProductsDisplay(formatted);

        const uniqueCategories = [...new Set(formatted.map(item => item.category.name))];
        setCategories(uniqueCategories);

        const bestSellers = formatted.filter(p => p.isBestSeller).slice(0, 8);
        setBestSellerProducts(bestSellers);

        const preBuilt = formatted
          .filter(p => p.category?.name && p.category.name.toLowerCase().includes('pre-built'))
          .slice(0, 8);
        setPreBuiltProducts(preBuilt);

      } catch (err) {
        console.error("❌ Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  if (!fontsLoaded) return null;

  const openAdminChat = async () => {
    if (!user?._id) {
      Alert.alert("Not logged in", "You must be logged in to chat with Admin");
      return;
    }

    try {
      const res = await api.get(`/chats/${user._id}/admin`);
      const chat = res.data;

      navigation.navigate("Chat", {
        chatId: chat._id,
        userId: user._id,
      });
    } catch (err) {
      console.error("Failed to open chat with Admin:", err);
      Alert.alert("Error", "Unable to open chat. Please try again later.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Image
            source={require('../assets/PCREXBIGLOGOMOBILE.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.rightHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('SearchProduct')} style={styles.searchIconContainer}>
            <Icon name="magnify" size={26} color={THEME.icons} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.headerIcon}
          >
            <View>
              <Icon name="cart-outline" size={26} color={THEME.icons} />
              {Number(itemCount) > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Account')} style={styles.headerIcon}>
            <Icon name="account-outline" size={26} color={THEME.icons} />
          </TouchableOpacity>

          <TouchableOpacity onPress={openAdminChat} style={styles.headerIcon}>
            <Icon name="message-text-outline" size={26} color={THEME.icons} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <BannerSlider />
        <CategoryList categories={categories} navigation={navigation} />
        <BestSellerSection data={bestSellerProducts} navigation={navigation} />
        <PreBuiltSection data={preBuiltProducts} navigation={navigation} />

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Just For You</Text>
          </View>
          <View style={styles.allProductsGrid}>
            {allProductsDisplay.map((item) => (
              <View key={item._id || item.id} style={styles.gridCardContainer}>
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetails', { product: item })}
                />
              </View>
            ))}
          </View>
          {allProductsDisplay.length === 0 && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No Products Found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background, paddingBottom: Platform.OS === 'android' ? 80 : 70 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: THEME.background, borderBottomWidth: 1, borderBottomColor: '#eee' },
  leftHeader: { flexDirection: 'row', alignItems: 'center' },
  rightHeader: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 80, height: 50 },
  searchIconContainer: { padding: 5 },
  headerIcon: { marginLeft: 15 },
  badgeContainer: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  sectionContainer: { marginTop: 20, paddingVertical: 15, borderRadius: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontFamily: 'Rubik-SemiBold', color: THEME.text },
  allProductsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  gridCardContainer: { width: '50%' },
  noResultsContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 150 },
  noResultsText: { fontSize: 16, color: '#6c757d', fontFamily: 'Rubik-Regular' },
});
