import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Keyboard,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font'; // Assuming Expo for font loading

import itemsData from '../data/Item.json'; // Import your item data
import ProductCard from '../Components/ProductCard'; 
import { useCart } from '../context/CartContext'; // Import useCart

// Consistent THEME object
const THEME = {
  primary: '#074ec2',
  background: '#FAFAFA',
  text: '#FFFFFF',
  searchtext: '#1C1C1C',
  cardBackground: '#FFFFFF',
  icons: '#FFFFFF', // Icons for SearchProduct will be dark
  placeholder: '#8f8f8fff',
  clearButton: '#FF0022',
  borderColor: '#074ec2',
  accent: '#074ec2', // A distinct color for prices or accents
};


const SearchProduct = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const { itemCount } = useCart(); // Get itemCount from cart context

  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  useEffect(() => {
    const allItems = itemsData.map(item => ({
      ...item,
      category: item.category || { name: 'Unknown' } 
    }));
    
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    setSuggestedItems(shuffled.slice(0, 6)); 
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const lowercasedQuery = searchQuery.toLowerCase();
      const results = itemsData.filter(item =>
        item.name.toLowerCase().includes(lowercasedQuery) ||
        (item.category && item.category.name.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredItems(results);
    } else {
      setFilteredItems([]); 
    }
  }, [searchQuery]);

  const handleItemPress = (item) => {
    Keyboard.dismiss(); 
    navigation.navigate('ProductDetails', { product: item }); 
  };

  const renderProduct = ({ item }) => (
    <View style={styles.gridCardContainer}>
        <ProductCard 
            product={item} 
            onPress={() => handleItemPress(item)} 
        />
    </View>
  );

  // If fonts are not loaded, you might want to render a loading screen
  if (!fontsLoaded) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
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
            keyExtractor={(item) => item.id.toString()}
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
            keyExtractor={(item) => item.id.toString()}
            numColumns={2} 
            contentContainerStyle={styles.listContentContainer}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingBottom: Platform.OS === 'ios' ? 80 : 120
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: THEME.primary, 
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
   
  },
  backButton: {
    marginRight: 0,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.cardBackground, 
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.searchtext,
    marginLeft: 5,
    fontFamily: 'Rubik-Regular', 
  },
  clearButton: {
    padding: 5,
   
  },
  listContentContainer: { 
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  gridCardContainer: { 
    width: '50%', 
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    flex: 1,
    backgroundColor: THEME.background,
  },
  noResultsText: {
    fontSize: 16,
    fontFamily: 'Rubik-Medium',
    color: THEME.placeholder,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 30,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 25,
    fontFamily: 'Rubik-Bold',
    marginBottom: 10,
    color: THEME.primary,
    paddingHorizontal: 15, // Adjusted padding to align with items
  },
  // New styles for the cart icon and badge
  headerIcon: {
    marginLeft: 10, // Space between icons
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default SearchProduct;