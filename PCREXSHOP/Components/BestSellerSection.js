// BestSellerSection.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductCard from './ProductCard';

const { width } = Dimensions.get('window');
const THEME = {
  primary: '#074ec2',
  secondary: '#FFD700', // Gold color for Best Seller icon
  text: '#1C1C1C',
  background: '#FFFFFF',
  accent: '#34C759',
  cardBackground: '#FFFFFF',
  shadowColor: '#000',
};

const BestSellerSection = ({ title, data, navigation }) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  if (!data || data.length === 0) return null;

  const handleMorePress = () => {
    navigation.navigate('CategoryProducts', { categoryName: 'Best Seller' });
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Best Seller</Text>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
          <Text style={styles.moreText}>View All</Text>
          <Icon name="arrow-right" size={18} color={THEME.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <View style={[
            styles.productCardWrapper,
            index === 0 && styles.firstCard,
            index === data.length - 1 && styles.lastCard
          ]}>
           
            <ProductCard 
              product={item} 
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              showBestSellerBadge={false} // Ensure ProductCard itself doesn't show another badge
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={width * 0.68 + 16}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 0,
    paddingVertical: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18, 
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Rubik-Medium',
    color: THEME.text,
    letterSpacing: -0.4,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moreText: {
    fontSize: 14,
    fontFamily: 'Rubik-SemiBold',
    color: THEME.primary,
  },
  listContent: {
    paddingHorizontal: 12, // Increased horizontal padding for list
    gap: 0, // Increased gap between product cards
  },
  productCardWrapper: {
    width: width * 0.5, 
  },
  firstCard: {
    marginLeft: 0,
  },
  lastCard: {
    marginRight: 0,
  },
});

export default BestSellerSection;