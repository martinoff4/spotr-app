import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { background, card, primary, textPrimary, textSecondary } from '../../theme/colors';
import { useSpots } from '../../context/SpotsContext';
import { getUserProfile, updateUserProfile } from '../../storage/userProfile';

const placeholderImage =
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80';

export default function FavoritesScreen({ navigation }) {
  const { spots, favorites: contextFavorites, toggleFavorite } = useSpots();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { width } = useWindowDimensions();

  const computeCardWidth = useMemo(() => {
    const horizontalPadding = 20 * 2;
    const gap = 12;
    const columns = 2;
    return (width - horizontalPadding - gap * (columns - 1)) / columns;
  }, [width]);

  const fetchFavorites = useCallback(async () => {
    const profile = await getUserProfile();
    return Array.isArray(profile.favorites) ? profile.favorites : [];
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const storedFavorites = await fetchFavorites();
        if (isActive) {
          setFavoriteIds(storedFavorites);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [fetchFavorites]),
  );

  const handleRemoveFavorite = useCallback(
    async (spotId) => {
      let updatedFavorites = [];
      setFavoriteIds((prev) => {
        const next = prev.filter((id) => id !== spotId);
        updatedFavorites = next;
        return next;
      });
      try {
        await updateUserProfile({ favorites: updatedFavorites });
        const desiredState = updatedFavorites.includes(spotId);
        const contextHas = contextFavorites.includes(spotId);
        if (typeof toggleFavorite === 'function' && contextHas !== desiredState) {
          toggleFavorite(spotId);
        }
      } catch (_error) {
        const latest = await fetchFavorites();
        setFavoriteIds(latest);
      }
    },
    [contextFavorites, toggleFavorite, fetchFavorites],
  );

  const favoriteSpots = useMemo(
    () => spots.filter((spot) => favoriteIds.includes(spot.id)),
    [spots, favoriteIds],
  );

  const renderFavorite = ({ item }) => {
    const cover =
      (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) ||
      item.thumbnail ||
      placeholderImage;
    return (
      <View style={[styles.cardWrapper, { width: computeCardWidth }]}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.getParent()?.navigate('SpotDetails', { spot: item })}
        >
          <Image
            source={{ uri: cover }}
            style={[styles.cardImage, { height: computeCardWidth * 0.75 }]}
          />
          <View style={styles.cardFooter}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.city || 'Неизвестен град'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardHeart}
          onPress={() => handleRemoveFavorite(item.id)}
          activeOpacity={0.8}
        >
          <Feather name="heart" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Любими места</Text>
      {favoriteSpots.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Няма любими места</Text>
          <Text style={styles.emptySubtitle}>Добави място от неговата страница.</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteSpots}
          keyExtractor={(item) => item.id}
          renderItem={renderFavorite}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  screenTitle: {
    color: textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: textSecondary,
    textAlign: 'center',
  },
  gridContent: {
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 18,
    backgroundColor: card,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardFooter: {
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    color: textPrimary,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: textSecondary,
    fontSize: 12,
  },
  cardHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
