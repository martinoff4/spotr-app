import React from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { card, textPrimary, textSecondary } from '../theme/colors';
import { useSpots } from '../context/SpotsContext';

const riskColors = {
  low: '#10B981',
  medium: '#FACC15',
  high: '#EF4444',
};

export default function SpotCard({ spot, onPress, isFavorite, onToggleFavorite }) {
  const { getShotCount, getSpotRating } = useSpots();
  const thumbnailSource = {
    uri:
      spot.thumbnail ||
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
  };
  const shotCount = getShotCount(spot.id);
  const ratingInfo = getSpotRating(spot.id);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image source={thumbnailSource} style={styles.thumbnail} resizeMode="cover" />
        <Pressable
          style={styles.heartButton}
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite?.(spot.id);
          }}
          hitSlop={12}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color="#FFF" />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{spot.name}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{spot.type}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{spot.bestTime}</Text>
          </View>
          <View style={[styles.badge, styles.riskBadge, { borderColor: riskColors[spot.riskLevel] || '#6B7280' }]}>
            <Text style={[styles.badgeText, styles.riskText]}>{spot.riskLevel}</Text>
          </View>
        </View>
        <Text style={styles.city}>{spot.city}</Text>
        {(shotCount > 0 || ratingInfo.average !== null) && (
          <View style={styles.communityRow}>
            {shotCount > 0 && <Text style={styles.communityText}>Снимали: {shotCount}</Text>}
            {ratingInfo.average !== null && (
              <View style={styles.ratingChip}>
                <Text style={styles.ratingChipText}>★ {ratingInfo.average.toFixed(1)}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00000088',
    padding: 8,
    borderRadius: 999,
  },
  body: {
    padding: 16,
  },
  title: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#1F2027',
  },
  badgeText: {
    color: textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  riskBadge: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  riskText: {
    color: textPrimary,
    fontWeight: '600',
  },
  city: {
    color: textSecondary,
    marginTop: 12,
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  communityText: {
    color: textSecondary,
    marginRight: 12,
    fontSize: 12,
  },
  ratingChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#1F2027',
  },
  ratingChipText: {
    color: '#FFD166',
    fontWeight: '700',
  },
});
