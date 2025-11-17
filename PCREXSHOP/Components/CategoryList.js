// CategoryList.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';

// Icon mapping
const categoryIcons = {
  'All': 'apps', // dagdag natin icon for "All"
  'Components': 'memory',
  'Peripherals': 'keyboard-outline',
  'Furniture': 'desk',
  'Pre-Built': 'desktop-tower-monitor',
  'Accessories': 'usb'
};

const CategoryList = ({ categories, navigation }) => {
  const route = useRoute();

  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  // Current active category (kapag nasa CategoryProducts screen)
  const activeCategory = route.name === 'CategoryProducts' ? route.params?.categoryName : null;

  // Lagyan natin ng "All" option sa unahan
  const allCategories = ['All', ...categories];

  return (
    <View style={styles.categorySectionContainer}>
      <Text style={styles.CategoriesText}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {allCategories.map((cat, index) => {
          const isActive = cat === activeCategory || (cat === 'All' && route.name === 'Home');

          return (
            <TouchableOpacity
              key={index}
              style={[styles.categoryButton, 
                isActive ? styles.activeButton : styles.inactiveButton
              ]}
              onPress={() => {
                if (cat === 'All') {
                  navigation.navigate('Home', { categoryName: 'All Products' });
                } else {
                  navigation.navigate('CategoryProducts', { categoryName: cat });
                }
              }}
            >
              <View style={styles.buttonContent}>
                <Icon 
                  name={categoryIcons[cat] || 'help-circle'} 
                  size={20} 
                  color={isActive ? '#FFFFFF' : '#074ec2'} 
                />
                <Text style={[
                  styles.categoryText, 
                  { color: isActive ? '#FFFFFF' : '#074ec2' }
                ]}>
                  {cat}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categorySectionContainer: { marginVertical: 16 },
  CategoriesText:{ fontSize: 18, fontFamily: 'Rubik-Medium', paddingHorizontal: 16, marginBottom: 12},
  categoryScroll: { paddingHorizontal: 16 },

  categoryButton: {
    borderRadius: 15,
    marginRight: 10,
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  activeButton: {
    backgroundColor: '#074ec2',
    borderColor: '#074ec2',
  },

  inactiveButton: {
    backgroundColor: 'transparent',
    borderColor: '#074ec2',
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  categoryText: {
    fontFamily: 'Rubik-SemiBold',
    fontSize: 14,
    marginLeft: 5
  },
});

export default CategoryList;
