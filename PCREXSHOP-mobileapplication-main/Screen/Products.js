import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar, 
  Platform
} from 'react-native';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Item from '../data/Item.json';

import CategoryList from '../Components/CategoryList';
import ProductCard from '../Components/ProductCard';

const THEME = {
  primary: '#074ec2',
  background: '#FAFAFA',
  text: '#1C1C1C',
  cardBackground: '#FFFFFF',
  icons: '#FFFFFF'
};

const Products = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });
      
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts] = useState(Item.map(item => ({
    ...item,
    category: item.category || { name: 'Unknown' } // Ensure category object exists
  }))); // Process items once
  const [filteredProducts, setFilteredProducts] = useState(allProducts);
  const [categories, setCategories] = useState([]); // State to hold unique categories
  const { itemCount } = useCart();

  useEffect(() => {
    // Derive unique categories from allProducts (removed 'All Products')
    const uniqueCategories = [...new Set(allProducts.map(item => item.category.name))];
    setCategories(uniqueCategories);
  }, [allProducts]); // Re-run if allProducts changes (though it's useState once)


  useEffect(() => {
    let result = allProducts;

    if (searchQuery.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredProducts(result);
  }, [searchQuery, allProducts]);

  if (!fontsLoaded) {
    return null;
  }

  const renderProduct = ({ item }) => (
    <View style={styles.gridCardContainer}>
      <ProductCard product={item} onPress={() => navigation.navigate('ProductDetails', { product: item })} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />

<View style={styles.header}>
  {/* Back Icon - Left */}
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Icon name="chevron-left" size={28} color={THEME.cardBackground} />
  </TouchableOpacity>

  {/* Right Side Icons */}
  <View style={styles.rightIcons}>
    {/* Search */}
    <TouchableOpacity 
      onPress={() => navigation.navigate('SearchProduct')} 
      style={styles.searchIconContainer}
    >
      <Icon name="magnify" size={26} color={THEME.icons} />
    </TouchableOpacity>

    {/* Cart with Badge */}
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

    {/* Account */}
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


     <CategoryList categories={categories} navigation={navigation} />
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id.toString()}
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
    backgroundColor: THEME.background
  },
  header: {
  backgroundColor: THEME.primary,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16, 
  paddingVertical: 10,
},

rightIcons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15, // spacing between icons
},

searchIconContainer: {
  padding: 5,
},

headerIcon: {
  marginLeft: 4,
},

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

badgeText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: 'bold'
},
  gridCardContainer: {
    width: '50%',
  },
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