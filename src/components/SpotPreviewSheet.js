import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { card, primary, textPrimary, textSecondary } from '../theme/colors';

const fallbackImage = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d';
const sheetHeight = 320;
const visibleOffset = 100;

export default function SpotPreviewSheet({
  spot,
  onClose,
  onNavigate,
  onDetails,
  getShotCount,
  getSpotRating,
  bottomInset = 0,
}) {
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const panStart = useRef(0);

  useEffect(() => {
    if (spot) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 220,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [spot, translateY]);

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: sheetHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
      translateY.setValue(sheetHeight);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 4,
      onPanResponderGrant: () => {
        translateY.stopAnimation((value) => {
          panStart.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const nextValue = Math.min(
          sheetHeight,
          Math.max(-visibleOffset, panStart.current + gestureState.dy),
        );
        translateY.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentOffset = panStart.current + gestureState.dy;
        if (currentOffset > 80 || gestureState.vy > 0.4) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 220,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 220,
        }).start();
      },
    }),
  ).current;

  if (!spot) {
    return null;
  }

  const shotCount = getShotCount(spot.id);
  const ratingInfo = getSpotRating(spot.id);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          paddingBottom: 16 + bottomInset,
          transform: [{ translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.handle} />
      <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
        <Ionicons name="close" size={20} color={textSecondary} />
      </TouchableOpacity>
      <View style={styles.content}>
        <Image
          source={{ uri: spot.thumbnail || fallbackImage }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {spot.name}
          </Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{spot.type}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{spot.bestTime}</Text>
            </View>
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {spot.shortDescription}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>Снимали: {shotCount}</Text>
            <Text style={styles.statText}>
              {ratingInfo.count > 0
                ? `Рейтинг: ${ratingInfo.average.toFixed(1)} / 5`
                : 'Рейтинг: н/д'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={onNavigate}>
          <Ionicons name="navigate" size={18} color="#FFF" />
          <Text style={styles.primaryLabel}>Навигирай</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onDetails}>
          <Text style={styles.secondaryLabel}>Виж детайли</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 54,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A2C33',
    alignSelf: 'center',
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1C22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2F3138',
    marginRight: 8,
  },
  tagText: {
    color: textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  subtitle: {
    color: textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statText: {
    color: textSecondary,
    fontSize: 12,
  },
  actions: {},
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  primaryLabel: {
    color: '#FFF',
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: primary,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryLabel: {
    color: primary,
    fontWeight: '700',
  },
});
