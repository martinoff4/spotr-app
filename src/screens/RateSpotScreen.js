import React, { useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { background, card, primary, textPrimary, textSecondary } from '../theme/colors';
import { useSpots } from '../context/SpotsContext';

export default function RateSpotScreen({ route }) {
  const spotId = route.params?.spotId;
  const { spots, addRating, getSpotRating } = useSpots();
  const spot = useMemo(() => spots.find((item) => item.id === spotId), [spots, spotId]);
  const ratingInfo = getSpotRating(spotId);
  const hasRating = ratingInfo && ratingInfo.count > 0;
  const average = hasRating ? ratingInfo.average : null;
  const count = hasRating ? ratingInfo.count : 0;
  const roundedAverage = average ? Math.round(average) : 0;

  const handleAddRating = (value) => {
    const normalized = Math.max(1, Math.min(5, value));
    addRating(spotId, normalized);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Feather name="star" size={18} color={textSecondary} />
          <Text style={styles.headerTitle}>Оцени мястото</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.spotName}>{spot?.name || 'SPOTR локация'}</Text>
          {hasRating ? (
            <Text style={styles.ratingSummary}>
              Текуща оценка: {average.toFixed(1)} / 5 · {count} гласа
            </Text>
          ) : (
            <Text style={styles.ratingSummary}>Все още няма оценки. Бъди първият.</Text>
          )}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.starButton}
                onPress={() => handleAddRating(value)}
              >
                <MaterialCommunityIcons
                  name={value <= roundedAverage ? 'star' : 'star-outline'}
                  size={32}
                  color={primary}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helperText}>
            Избери звезди, за да оцениш как се снима на това място. Всеки глас помага на
            останалите.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    backgroundColor: card,
    borderRadius: 20,
    padding: 20,
  },
  spotName: {
    color: textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  ratingSummary: {
    color: textSecondary,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  helperText: {
    color: textSecondary,
    lineHeight: 20,
  },
});
