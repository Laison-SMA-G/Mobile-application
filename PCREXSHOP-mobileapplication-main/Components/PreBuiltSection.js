// PreBuiltSection.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductCard from './ProductCard';

const { width } = Dimensions.get('window');
const THEME = {
  primary: '#074ec2',
  secondary: '#5856D6', // Original secondary color for Pre-built
  text: '#1C1C1C',
  background: '#FAFAFA',
  accent: '#34C759', // Green for positive tags
  cardBackground: '#FFFFFF',
  shadowColor: '#000',
};

const PreBuiltSection = ({ title, data, navigation }) => {
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
    navigation.navigate('CategoryProducts', { categoryName: 'Pre-built' });
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Pre-Built</Text>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
          <Text style={styles.moreText}>Explore All</Text>
          <Icon name="arrow-right" size={18} color={THEME.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.productCardWrapper}>
            <ProductCard 
              product={item} 
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={width * 0.68 + 16} // Adjusted for potential card width changes
        decelerationRate="fast"
      />
      
     
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 0,
    paddingVertical: 15,
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
    gap: 10, // Increased gap for better spacing
  },
  sectionTitle: {
    fontSize: 18, // Slightly larger title
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

  
});

export default PreBuiltSection;