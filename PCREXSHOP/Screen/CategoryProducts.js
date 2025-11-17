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
    TextInput
} from 'react-native';
import { useFonts } from 'expo-font';
import { useCart } from '../context/CartContext';
import ProductCard from '../Components/ProductCard';
import Item from '../data/Item.json';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const THEME = {
  primary: '#074ec2',
  background: '#FFFFFF',
  text: '#1C1C1C',
  cardBackground: '#FFFFFF',
  icons: '#FFFFFF',
  placeholder: '#A0A0A0', // Lighter placeholder text
  borderColor: '#E0E0E0', // Light border for search input
};

const CategoryProducts = ({ route, navigation }) => {
    const [fontsLoaded] = useFonts({
      'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
      'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
      'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
      'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
    });

  const { categoryName } = route.params;
  
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  

  useEffect(() => {
    let baseProducts = [];
    
    // Ensure all items have a category object
    const allItems = Item.map(item => ({
        ...item,
        category: item.category || { name: 'Unknown' }
    }));

    if (categoryName.toLowerCase() === 'best seller') {
      baseProducts = allItems.filter(p => p.isBestSeller); 
    } else if (categoryName.toLowerCase() === 'pre-built') {
      baseProducts = allItems.filter(p => p.category && p.category.name.toLowerCase() === 'pre-built');
    } else if (categoryName.toLowerCase() === 'all products') {
      baseProducts = allItems;
    } else {
      baseProducts = allItems.filter(p => p.category && p.category.name.toLowerCase() === categoryName.toLowerCase());
    }

    if (searchQuery.trim() !== '') {
      const filteredProducts = baseProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filteredProducts);
    } else {
      setProducts(baseProducts);
    }
  }, [categoryName, searchQuery]);

  if (!fontsLoaded) {
    return null;
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
        
          <View style={styles.header}>
            {/* Back Icon - Left */}
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.headerIconWrapper}
            >
              <Icon name="chevron-left" size={28} color={THEME.icons} />
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
              <TouchableOpacity 
                onPress={() => navigation.navigate('Cart')} 
                style={styles.headerIconWrapper}
              >
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
              <TouchableOpacity 
                onPress={() => navigation.navigate('Account')} 
                style={styles.headerIconWrapper}
              >
                <Icon name="account-outline" size={26} color={THEME.icons} />
              </TouchableOpacity>
            </View>
          </View>


         <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{categoryName}</Text>
            {/* Optional subtitle based on category */}
            {categoryName.toLowerCase() === 'pre-built' && 
              <Text style={styles.subtitleText}>Ready-to-go powerful machines</Text>
            }
            {categoryName.toLowerCase() === 'best seller' && 
              <Text style={styles.subtitleText}>Our most popular picks loved by gamers</Text>
            }
            {categoryName.toLowerCase() === 'components' && 
              <Text style={styles.subtitleText}>Essential parts to build your dream PC</Text>
            }
            {categoryName.toLowerCase() === 'peripherals' && 
              <Text style={styles.subtitleText}>Keyboards, mice, headsets, and more</Text>
            }
            {categoryName.toLowerCase() === 'furniture' && 
              <Text style={styles.subtitleText}>Chairs and desks built for comfort</Text>
            }
            {categoryName.toLowerCase() === 'accessories' && 
              <Text style={styles.subtitleText}>Extra gear to complete your setup</Text>
            }
           
        </View>

        <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContentContainer}
            ListEmptyComponent={
                <View style={styles.noResultsContainer}>
                    <Icon name="information-outline" size={50} color={THEME.placeholder} style={{marginBottom: 10}} />
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
    container: { 
        flex: 1, 
        backgroundColor: THEME.background 
    },
    header: { 
  backgroundColor: THEME.primary, 
  flexDirection: 'row', 
  alignItems: 'center', 
  justifyContent: 'space-between', // separate left & right
  paddingHorizontal: 16,
  paddingVertical: 10, 
},

rightIcons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 15, // spacing between search, cart, account
},

headerIconWrapper: {
  padding: 0, // tappable padding
},

searchIconContainer: {
  padding: 5,
},

badgeContainer: {
  position: 'absolute',
  top: -5,
  right: -8,
  backgroundColor: '#EE2323',
  borderRadius: 10,
  width: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1.5,
  borderColor: THEME.primary,
},

badgeText: {
  color: '#FFFFFF',
  fontSize: 10,
  fontWeight: 'bold',
},

    titleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 18, // Increased vertical padding
        backgroundColor: THEME.background,
        borderBottomWidth: 1, // Subtle separator
        borderBottomColor: '#F0F0F0',
        marginBottom: 8, // Space before the list
    },
    titleText: {
        fontSize: 24, // Larger title
        fontFamily: 'Rubik-Bold', // Bolder title
        color: THEME.text,
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitleText: {
        fontSize: 14,
        fontFamily: 'Rubik-Regular',
        color: THEME.placeholder,
    },
    listContentContainer: { 
        paddingHorizontal: 12, // Overall padding for the grid
        paddingBottom: 20, // Padding at the bottom of the list
    },
    gridCardContainer: { 
        width: '50%', 
    },
    noResultsContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 80, // More vertical padding
        flex: 1, 
        backgroundColor: THEME.background,
    },
    noResultsText: { 
        fontSize: 16, 
        fontFamily: 'Rubik-Medium',
        color: THEME.placeholder, // Lighter text color
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 30,
    },
});

export default CategoryProducts;