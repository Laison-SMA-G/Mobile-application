import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { BANNERS } from '../constants/banners'; // Import data

const { width } = Dimensions.get('window');

const BannerSlider = () => {
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveBannerIndex(viewableItems[0].index || 0);
    }
  }).current;
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  useEffect(() => {
    const interval = setInterval(() => {
      if (bannerRef.current) {
        const nextIndex = (activeBannerIndex + 1) % BANNERS.length;
        bannerRef.current.scrollToIndex({ index: nextIndex, animated: true });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBannerIndex]);

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerContainer}>
      <Image source={item.image} style={styles.bannerImage} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.sliderWrapper}>
      <FlatList
        ref={bannerRef}
        data={BANNERS}
        renderItem={renderBannerItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.pagination}>
        {BANNERS.map((_, index) => (
          <View key={index} style={[styles.dot, activeBannerIndex === index ? styles.dotActive : null]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderWrapper: { height: 180, marginTop: 16 },
  bannerContainer: { width: width, height: 180, paddingHorizontal: 16 },
  bannerImage: { width: '100%', height: '100%', borderRadius: 15 },
  pagination: { position: 'absolute', bottom: 15, flexDirection: 'row', alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.5)', marginHorizontal: 4 },
  dotActive: { backgroundColor: 'rgba(255, 255, 255, 0.9)', width: 20 },
});

export default BannerSlider;