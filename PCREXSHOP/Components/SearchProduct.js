import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import ProductCard from './ProductCard';
import { useCart } from '../context/CartContext';
import { debounce } from 'lodash';

const THEME = {
  primary: '#074ec2',
  background: '#FAFAFA',
  text: '#FFFFFF',
  searchtext: '#1C1C1C',
  cardBackground: '#FFFFFF',
  icons: '#1C1C1C',
  placeholder: '#8f8f8fff',
  clearButton: '#FF0022',
  borderColor: '#074ec2',
  accent: '#074ec2',
};

const BASE_URL = 'https://Mobile-application-2.onrender.com/api/products'; // replace with your API endpoint

const SearchProduct = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { itemCount } = useCart();

  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(BASE_URL);
        const items = response.data.map(item => ({
          ...item,
          category: item.category || { name: 'Unknown' },
        }));
        setAllItems(items);

        // shuffle for suggested items
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        setSuggestedItems(shuffled.slice(0, 6));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Debounced search
  const performSearch = useCallback(
    debounce((query) => {
      if (query.length > 0) {
        const lowercasedQuery = query.toLowerCase();
        const results = allItems.filter(item =>
          [item.name, item.category?.name].some(
            field => field?.toLowerCase().includes(lowercasedQuery)
          )
        );
        setFilteredItems(results);
      } else {
        setFilteredItems([]);
      }
    }, 200),
    [allItems]
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleItemPress = (item) => {
    Keyboard.dismiss();
    navigation.navigate('ProductDetails', { product: item });
  };

  const renderProduct = useCallback(({ item }) => (
    <View style={styles.gridCardContainer}>
      <ProductCard 
        product={item} 
        onPress={() => handleItemPress(item)} 
      />
    </View>
  ), [navigation]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.searchBarWrapper}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={30} color={THEME.text} />
          </TouchableOpacity>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={22} color={THEME.placeholder} style={{ marginLeft: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search all products..."
              placeholderTextColor={THEME.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButtonTouch}>
                <Icon name="close-circle" size={20} color={THEME.clearButton} />
              </TouchableOpacity>
            )}
          </View>

          {/* Cart Icon */}
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerIcon}>
            <View>
              <Icon name="cart-outline" size={26} color={THEME.icons} />
              {itemCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {searchQuery.length > 0 ? (
          filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id.toString()} // Use _id from API
              numColumns={2}
              contentContainerStyle={styles.listContentContainer}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="information-outline" size={50} color={THEME.placeholder} style={{marginBottom: 10}} />
              <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
            </View>
          )
        ) : (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggested for you</Text>
            <FlatList
              data={suggestedItems}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id.toString()}
              numColumns={2}
              contentContainerStyle={styles.listContentContainer}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: THEME.primary },
  backButton: { marginRight: 5 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.text, borderRadius: 8, paddingHorizontal: 5 },
  searchInput: { flex: 1, height: 40, color: THEME.searchtext },
  clearButtonTouch: { padding: 5 },
  headerIcon: { marginLeft: 10 },
  badgeContainer: { position: 'absolute', top: -5, right: -10, backgroundColor: 'red', borderRadius: 8, paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontSize: 12 },
  gridCardContainer: { flex: 1, margin: 5 },
  listContentContainer: { paddingBottom: 20 },
  noResultsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  noResultsText: { color: THEME.placeholder, fontSize: 16, textAlign: 'center' },
  suggestionsContainer: { flex: 1, paddingTop: 10 },
  suggestionsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginLeft: 10, color: THEME.searchtext },
});

export default SearchProduct;
