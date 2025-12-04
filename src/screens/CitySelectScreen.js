import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSpots } from '../context/SpotsContext';
import { background, card, primary, textPrimary, textSecondary } from '../theme/colors';

const cities = ['Sofia', 'Plovdiv', 'Varna'];

export default function CitySelectScreen({ navigation }) {
  const { userCity, setUserCity } = useSpots();

  const handleSelect = async (city) => {
    await setUserCity(city);
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Къде караш най-често?</Text>
      <Text style={styles.subtitle}>Избери град, за да ти покажем най-подходящите SPOT-ове.</Text>
      <View style={styles.list}>
        {cities.map((city) => {
          const isActive = city === userCity;
          return (
            <TouchableOpacity
              key={city}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => handleSelect(city)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cityLabel}>{city}</Text>
                <Text style={[styles.citySubtitle, isActive && styles.citySubtitleActive]}>
                  {isActive ? 'Текущ избор' : 'Избери този град'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
    padding: 24,
  },
  title: {
    color: textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  list: {},
  card: {
    backgroundColor: card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2027',
    marginBottom: 16,
  },
  cardActive: {
    borderColor: primary,
    backgroundColor: '#1A0A12',
  },
  cardContent: {
    flexDirection: 'column',
  },
  cityLabel: {
    color: textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  citySubtitle: {
    color: textSecondary,
    marginTop: 6,
  },
  citySubtitleActive: {
    color: primary,
    fontWeight: '600',
  },
});
