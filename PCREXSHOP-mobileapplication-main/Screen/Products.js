import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CategoryList from '../Components/CategoryList';
import ProductCard from '../Components/ProductCard';

const THEME = {
  primary: '#074ec2',
  background: '#FAFAFA',
  text: '#1C1C1C',
  cardBackground: '#FFFFFF',
  icons: '#FFFFFF',
};

const Products = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();

  
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://192.168.100.45:5000/api/products');
      const data = await res.json();

          const formatted = data.map((item) => {
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;

          let images = [];
          if (Array.isArray(item.images) && item.images.length) {
            images = item.images;
          } else if (item.image) {
            images = [item.image];
          }

          // Ensure full URL
          images = images.map(img => {
              if (!img) return 'https://via.placeholder.com/150';
              if (img.startsWith('http')) return img;
              if (img.startsWith('/')) return `http://192.168.100.45:5000${img}`;
              return `http://192.168.100.45:5000/${img.replace(/\\/g, '/')}`;
            });


          return {
            ...item,
            quantity,
            image: images[0] || 'https://via.placeholder.com/150',
            images,
          };
        });


      setAllProducts(formatted);
      setFilteredProducts(formatted);

      // ✅ Extract unique categories
      const uniqueCategories = [...new Set(formatted.map((i) => i.category?.name || i.category || 'Unknown'))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
    }
  };

  fetchProducts();
}, []);


  useEffect(() => {
    let result = allProducts;
    if (searchQuery.trim() !== '') {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(result);
  }, [searchQuery, allProducts]);

  if (!fontsLoaded) return null;

  const renderProduct = ({ item }) => (
    <View style={styles.gridCardContainer}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

      {/* ✅ Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={THEME.cardBackground} />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SearchProduct')}
            style={styles.searchIconContainer}
          >
            <Icon name="magnify" size={26} color={THEME.icons} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <View>
              <Icon name="cart-outline" size={26} color={THEME.icons} />
              {itemCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Account')}>
            <Icon
              name="account-outline"
              size={26}
              color={THEME.cardBackground}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Category List */}
      <CategoryList categories={categories} navigation={navigation} />

      {/* ✅ Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id || item.id?.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No Products Found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 80 : 80,
    backgroundColor: THEME.background,
  },
  header: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  searchIconContainer: { padding: 5 },
  headerIcon: { marginLeft: 4 },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#EE2323',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  gridCardContainer: { width: '50%' },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6c757d',
    fontFamily: 'Rubik-Medium',
  },
});

export default Products;
