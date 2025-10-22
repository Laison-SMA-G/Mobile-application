// ProductSection.js (General Horizontal Product List)
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductCard from './ProductCard';

const THEME = {
  primary: '#074ec2',
  text: '#1C1C1C',
};

const ProductSection = ({ title, data, navigation }) => {
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
    navigation.navigate('CategoryProducts', { categoryName: title });
  };

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
          <Text style={styles.moreText}>More</Text>
          <Icon name="chevron-right" size={20} color={THEME.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={{ width: 160 }}>
            <ProductCard product={item} onPress={() => navigation.navigate('ProductDetails', { product: item })} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Rubik-Medium', color: THEME.text },
  moreButton: { flexDirection: 'row', alignItems: 'center' },
  moreText: { fontSize: 13, fontFamily: 'Rubik-SemiBold', color: '#888' }, // Consistent with BestSeller/PreBuilt
});

export default ProductSection;