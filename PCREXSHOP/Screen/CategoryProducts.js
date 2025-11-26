// CategoryProducts.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';
import ProductCard from '../Components/ProductCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from '../utils/getImageUri';

const THEME = {
  primary: '#074ec2',
  background: '#FFFFFF',
  text: '#1C1C1C',
  icons: '#FFFFFF',
  placeholder: '#A0A0A0',
  borderColor: '#E0E0E0',
};

const CategoryProducts = ({ route, navigation }) => {
  const { categoryName: rawCategoryName } = route.params || {};
  const categoryName = rawCategoryName || 'All Products';

  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { itemCount } = useCart();

  // Fetch all products once
  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/products`);
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Filter locally whenever category or searchQuery changes
  useEffect(() => {
    let filtered = allProducts;

    if (categoryName.toLowerCase() !== 'all products') {
      filtered = filtered.filter(p => {
        const cat = typeof p.category === 'string' ? p.category : p.category?.name;
        return cat?.toLowerCase() === categoryName.toLowerCase();
      });
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProducts(filtered);
  }, [categoryName, searchQuery, allProducts]);

  if (!fontsLoaded) return null;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={{ marginTop: 10 }}>Loading products...</Text>
      </View>
    );
  }

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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconWrapper}>
          <Icon name="chevron-left" size={28} color={THEME.icons} />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('SearchProduct')} style={styles.searchIconContainer}>
            <Icon name="magnify" size={26} color={THEME.icons} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerIconWrapper}>
            <View>
              <Icon name="cart-outline" size={26} color={THEME.icons} />
              {itemCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Account')} style={styles.headerIconWrapper}>
            <Icon name="account-outline" size={26} color={THEME.icons} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{categoryName}</Text>
        {categoryName.toLowerCase() === 'pre-built' && (
          <Text style={styles.subtitleText}>Ready-to-go powerful machines</Text>
        )}
        {categoryName.toLowerCase() === 'best seller' && (
          <Text style={styles.subtitleText}>Our most popular picks loved by gamers</Text>
        )}
        {categoryName.toLowerCase() === 'components' && (
          <Text style={styles.subtitleText}>Essential parts to build your PC</Text>
        )}
        {categoryName.toLowerCase() === 'peripherals' && (
          <Text style={styles.subtitleText}>Keyboards, mice, headsets, and more</Text>
        )}
        {categoryName.toLowerCase() === 'furniture' && (
          <Text style={styles.subtitleText}>Chairs and desks built for comfort</Text>
        )}
        {categoryName.toLowerCase() === 'accessories' && (
          <Text style={styles.subtitleText}>Extra gear to complete your setup</Text>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={22} color={THEME.placeholder} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search in this category..."
          placeholderTextColor={THEME.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Product Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item._id || Math.random().toString()}
        numColumns={2}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Icon name="information-outline" size={50} color={THEME.placeholder} style={{ marginBottom: 10 }} />
            <Text style={styles.noResultsText}>
              {searchQuery ? 'No matching products found.' : `No products available in "${categoryName}".`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background, paddingBottom: Platform.OS === 'ios' ? 80 : 80 },
  header: {
    backgroundColor: THEME.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerIconWrapper: { padding: 5 },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  searchIconContainer: { padding: 5 },
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

  titleContainer: { padding: 16 },
  titleText: { fontSize: 22, fontFamily: 'Rubik-Medium' },
  subtitleText: {
    fontSize: 14,
    marginTop: 4,
    color: THEME.placeholder,
    fontFamily: 'Rubik-Regular',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.borderColor,
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 44,
    backgroundColor: '#fff',
  },
  searchInput: { flex: 1, fontFamily: 'Rubik-Regular' },

  listContentContainer: { paddingHorizontal: 8, paddingBottom: 40 },
  gridCardContainer: { width: '50%' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResultsContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  noResultsText: { fontSize: 16, color: '#6c757d', fontFamily: 'Rubik-Medium' },
});

export default CategoryProducts;
