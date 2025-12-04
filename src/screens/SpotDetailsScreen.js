import { Feather } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSpots } from '../context/SpotsContext';
import { useSpotMedia } from '../hooks/useSpotMedia';
import { getUserProfile, updateUserProfile } from '../storage/userProfile';
import { getSpotMedia } from '../store/spotMediaStore';
import { background, card, primary, textPrimary, textSecondary } from '../theme/colors';
import { chooseNavigationApp } from '../utils/navigationUtils';

const riskBadges = {
  low: { label: 'Нисък риск', bg: '#166534' },
  medium: { label: 'Среден риск', bg: '#92400E' },
  high: { label: 'Висок риск', bg: '#7F1D1D' },
};

const placeholderImage =
  'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80';

export default function SpotDetailsScreen({ route }) {
  const navigation = useNavigation();
  const routeSpot = route.params?.spot;
  const {
    spots,
    favorites,
    toggleFavorite,
    toggleShot,
    getSpotRating,
    getShotCount,
    hasUserShotHere,
  } = useSpots();
  const { width } = useWindowDimensions();
  const [heroIndex, setHeroIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [userSpotPhoto, setUserSpotPhoto] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const viewerListRef = useRef(null);
  const isFocused = useIsFocused();

  const spot = useMemo(() => {
    if (!routeSpot) return null;
    return spots.find((item) => item.id === routeSpot.id) || routeSpot;
  }, [routeSpot, spots]);

  const images = useMemo(() => {
    if (spot?.images && Array.isArray(spot.images) && spot.images.length > 0) {
      return spot.images;
    }
    if (spot?.thumbnail) {
      return [spot.thumbnail];
    }
    return [placeholderImage];
  }, [spot]);

  const heroImage = images[heroIndex] || placeholderImage;
  const shotCount = spot ? getShotCount(spot.id) || 0 : 0;
  const hasShot = spot ? hasUserShotHere(spot.id) : false;
  const ratingInfo = spot ? getSpotRating(spot.id) : { average: null, count: 0 };
  const hasRating = ratingInfo && ratingInfo.count > 0;
  const ratingAverage = hasRating ? ratingInfo.average : null;
  const risk = riskBadges[spot?.riskLevel] || { label: 'Ниво риск', bg: '#374151' };

  const infoChips = [
    { icon: 'map-pin', value: spot?.city || '—' },
    { icon: 'clock', value: spot?.bestTime || '—' },
    { icon: 'camera', value: `${shotCount} снимали` },
  ];

  const tileWidth = Math.max((width - 16 * 2 - 12 * 2) / 3, 90);
  const { media: communityPhotos, addItems: addMediaItems } = useSpotMedia(spot?.id || '');

  useEffect(() => {
    let isMounted = true;
    const loadUserPhoto = async () => {
      if (!spot?.id) {
        if (isMounted) {
          setUserSpotPhoto(null);
        }
        return;
      }
      const profile = await getUserProfile();
      const photos = Array.isArray(profile.photos) ? profile.photos : [];
      const match = photos.find((item) => item.spotId === spot.id);
      if (isMounted) {
        setUserSpotPhoto(match?.uri || null);
      }
    };
    if (isFocused) {
      loadUserPhoto();
    }
    return () => {
      isMounted = false;
    };
  }, [spot?.id, isFocused]);

  useEffect(() => {
    let isMounted = true;
    const loadFavorite = async () => {
      if (!spot?.id) {
        if (isMounted) {
          setIsFavorite(false);
        }
        return;
      }
      const profile = await getUserProfile();
      const favoriteIds = Array.isArray(profile.favorites) ? profile.favorites : [];
      if (isMounted) {
        setIsFavorite(favoriteIds.includes(spot.id));
      }
    };
    if (isFocused) {
      loadFavorite();
    }
    return () => {
      isMounted = false;
    };
  }, [spot?.id, isFocused]);

  const orderedCommunityPhotos = useMemo(() => {
    if (!userSpotPhoto || !spot?.id) {
      return communityPhotos;
    }
    const existing = communityPhotos.find((item) => item.uri === userSpotPhoto);
    const others = communityPhotos.filter((item) => item.uri !== userSpotPhoto);
    if (existing) {
      return [existing, ...others];
    }
    return [
      {
        id: `user-${spot.id}`,
        spotId: spot.id,
        uri: userSpotPhoto,
        createdAt: new Date().toISOString(),
      },
      ...communityPhotos,
    ];
  }, [communityPhotos, userSpotPhoto, spot?.id]);

  useEffect(() => {
    if (viewerIndex >= orderedCommunityPhotos.length) {
      setViewerIndex(orderedCommunityPhotos.length ? orderedCommunityPhotos.length - 1 : -1);
      return;
    }
    if (viewerIndex >= 0 && viewerListRef.current) {
      try {
        viewerListRef.current.scrollToIndex({
          index: viewerIndex,
          animated: false,
        });
      } catch (_error) {
        // ignore if list not ready yet
      }
    }
  }, [viewerIndex, orderedCommunityPhotos.length]);

  const requestCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Нужен достъп', 'Разреши достъп до камерата, за да снимаш тук.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (result.canceled || !result.assets?.length) {
      return null;
    }
    return result.assets.map((asset) => asset.uri);
  };

  const requestLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Нужен достъп', 'Разреши достъп до галерията, за да качиш снимки.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled || !result.assets?.length) {
      return null;
    }
    return result.assets.slice(0, 3).map((asset) => asset.uri);
  };

  const handleFavoriteToggle = async () => {
    if (!spot?.id) return;
    try {
      const profile = await getUserProfile();
      const favoriteIds = Array.isArray(profile.favorites) ? profile.favorites : [];
      const exists = favoriteIds.includes(spot.id);
      const updatedFavorites = exists
        ? favoriteIds.filter((id) => id !== spot.id)
        : [spot.id, ...favoriteIds];
      await updateUserProfile({ favorites: updatedFavorites });
      const desiredState = !exists;
      setIsFavorite(desiredState);
      if (typeof toggleFavorite === 'function') {
        const contextHas = favorites.includes(spot.id);
        if (contextHas !== desiredState) {
          toggleFavorite(spot.id);
        }
      }
    } catch (_error) {
      // ignore favorite errors
    }
  };

  const handleAddPhotos = async (mode) => {
    if (uploading) return;
    setUploading(true);
    try {
      let uris = null;
      if (mode === 'camera') {
        uris = await requestCamera();
      } else {
        uris = await requestLibrary();
      }
      if (uris && uris.length && spot?.id) {
        const profile = await getUserProfile();
        await addMediaItems(uris, {
          userId: profile.id,
          username: profile.username,
          avatar: profile.avatar,
        });
        try {
          const photos = Array.isArray(profile.photos) ? profile.photos : [];
          const filtered = photos.filter((item) => item.spotId !== spot.id);
          const newEntry = {
            spotId: spot.id,
            uri: uris[uris.length - 1],
            createdAt: new Date().toISOString(),
          };
          await updateUserProfile({ photos: [newEntry, ...filtered] });
          setUserSpotPhoto(newEntry.uri);
        } catch (_error) {
          // ignore profile sync errors
        }
        if (!hasShot) {
          toggleShot(spot.id);
        }
        Alert.alert('Благодарим!', 'Снимките ти са добавени към това място.');
      }
    } finally {
      setUploading(false);
    }
  };

  const onShotPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: 'Снимал съм тук',
          options: ['Снимай', 'Избери от галерия', 'Отказ'],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) {
            handleAddPhotos('camera');
          } else if (index === 1) {
            handleAddPhotos('library');
          }
        },
      );
    } else {
      Alert.alert('Снимал съм тук', 'Избери действие', [
        { text: 'Снимай', onPress: () => handleAddPhotos('camera') },
        { text: 'От галерия', onPress: () => handleAddPhotos('library') },
        { text: 'Отказ', style: 'cancel' },
      ]);
    }
  };

  const navigateToProfile = async (mediaItem) => {
    const userId = mediaItem.userId;
    const username = mediaItem.username || 'Spotr User';
    const avatar = mediaItem.avatar || null;

    let userPhotos = [];

    if (userId) {
      const profile = await getUserProfile();
      if (profile.id === userId) {
        userPhotos = profile.photos || [];
      } else {
        for (const s of spots) {
          const media = await getSpotMedia(s.id);
          const match = media.filter((m) => m.userId === userId);
          userPhotos = [...userPhotos, ...match];
        }
      }
    } else {
      userPhotos = [mediaItem];
    }

    const unique = [];
    const seen = new Set();
    for (const p of userPhotos) {
      if (!seen.has(p.uri)) {
        seen.add(p.uri);
        unique.push(p);
      }
    }

    navigation.navigate('PublicProfile', {
      userId,
      username,
      avatar,
      photos: unique,
    });
  };

  const openViewer = (index) => {
    setViewerIndex(index);
  };

  const closeViewer = () => {
    setViewerIndex(-1);
  };

  if (!spot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingText}>Не открихме този spot.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={20} color={textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spot details</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroWrapper}>
          <Image source={{ uri: heroImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName} numberOfLines={2}>
              {spot.name}
            </Text>
            <Text style={styles.heroCity}>{spot.city || 'Неизвестен град'}</Text>
          </View>
        </View>

        {images.length > 1 && (
          <FlatList
            data={images}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbRow}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setHeroIndex(index)} activeOpacity={0.8}>
                <Image
                  source={{ uri: item }}
                  style={[
                    styles.thumbnail,
                    index === heroIndex && styles.thumbnailActive,
                  ]}
                />
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.titleSection}>
          <Text style={styles.title}>{spot.name}</Text>
          <Text style={styles.subtitle}>{spot.city || 'Неизвестен град'}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            {infoChips.map((chip, index) => (
              <View key={index} style={styles.infoItem}>
                <Feather name={chip.icon} size={14} color={textSecondary} />
                <Text style={styles.infoValue} numberOfLines={1}>
                  {chip.value}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Feather name="tag" size={14} color="#FFF" />
              <Text style={styles.chipText}>{spot.type || 'Spot'}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: risk.bg }]}>
              <Feather name="alert-triangle" size={14} color="#FFF" />
              <Text style={styles.chipText}>{risk.label}</Text>
            </View>
            <View style={styles.chip}>
              <Feather name="star" size={14} color="#FFF" />
              <Text style={styles.chipText}>{hasRating ? ratingAverage.toFixed(1) : '–'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}
              onPress={handleFavoriteToggle}
            >
              <Feather
                name="heart"
                size={16}
                color={isFavorite ? '#FFF' : textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => chooseNavigationApp(spot.lat, spot.lng, spot.name)}
        >
          <Feather name="navigation" size={18} color="#FFF" />
          <Text style={styles.primaryButtonLabel}>Навигирай</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            hasShot && styles.secondaryButtonActive,
          ]}
          onPress={onShotPress}
          disabled={uploading}
        >
          <Feather
            name="camera"
            size={16}
            color={hasShot ? '#FFF' : primary}
          />
          <Text
            style={[
              styles.secondaryButtonLabel,
              hasShot && styles.secondaryButtonLabelActive,
            ]}
          >
            {uploading ? 'Качваме…' : 'Снимал съм тук'}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="image" size={16} color={textSecondary} />
            <Text style={styles.sectionTitle}>Снимки от хората</Text>
          </View>
          {orderedCommunityPhotos.length > 0 ? (
            <View style={styles.mediaGrid}>
              {orderedCommunityPhotos.map((mediaItem, index) => {
                const isUserPhoto = Boolean(userSpotPhoto && mediaItem.uri === userSpotPhoto);
                return (
                  <View key={mediaItem.id} style={{ width: tileWidth }}>
                    <TouchableOpacity
                      style={styles.postTile}
                      onPress={() => openViewer(index)}
                      activeOpacity={0.9}
                    >
                      <Image source={{ uri: mediaItem.uri }} style={styles.postImage} />
                      {isUserPhoto && (
                        <View style={styles.myPhotoBadge}>
                          <Text style={styles.myPhotoBadgeText}>Твоят кадър</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.userRow}
                      onPress={() => navigateToProfile(mediaItem)}
                    >
                      {mediaItem.avatar ? (
                        <Image source={{ uri: mediaItem.avatar }} style={styles.tinyAvatar} />
                      ) : (
                        <View style={styles.tinyAvatarPlaceholder}>
                          <Feather name="user" size={10} color="#FFF" />
                        </View>
                      )}
                      <Text style={styles.tinyUsername} numberOfLines={1}>
                        {mediaItem.username || 'Spotr User'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Все още няма снимки от хората.</Text>
              <Text style={styles.emptySubtext}>Бъди първият – снимай тук и качи кадър.</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={16} color={textSecondary} />
            <Text style={styles.sectionTitle}>За това място</Text>
          </View>
          <Text style={styles.sectionBody}>
            {spot.shortDescription || `Подходящо място за снимки на коли с ${spot.type || 'уникален'} vibe.`}
          </Text>
        </View>

        <View style={styles.inlineActions}>
          <TouchableOpacity
            style={styles.inlineButton}
            onPress={() =>
              navigation.navigate('RateSpot', { spotId: spot.id, spotName: spot.name })
            }
          >
            <Feather name="star" size={16} color={primary} />
            <Text style={styles.inlineButtonText}>Оцени мястото</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inlineButton}
            onPress={() =>
              navigation.navigate('Comments', { spotId: spot.id, spotName: spot.name })
            }
          >
            <Feather name="message-circle" size={16} color={primary} />
            <Text style={styles.inlineButtonText}>Коментари</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={viewerIndex >= 0} transparent animationType="fade" onRequestClose={closeViewer}>
        <View style={styles.viewerBackdrop}>
          <TouchableWithoutFeedback onPress={closeViewer}>
            <View style={styles.viewerDismissArea} />
          </TouchableWithoutFeedback>
          <View style={styles.viewerContent}>
            <TouchableOpacity style={styles.viewerClose} onPress={closeViewer}>
              <Feather name="x" size={24} color="#FFF" />
            </TouchableOpacity>
            <FlatList
              ref={viewerListRef}
              data={orderedCommunityPhotos}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <ScrollView
                  style={{ width }}
                  contentContainerStyle={styles.viewerImageContainer}
                  minimumZoomScale={1}
                  maximumZoomScale={3}
                  centerContent
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  <TouchableWithoutFeedback onPress={closeViewer}>
                    <Image source={{ uri: item.uri }} style={styles.viewerImage} resizeMode="contain" />
                  </TouchableWithoutFeedback>
                </ScrollView>
              )}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
            />
            {orderedCommunityPhotos.length > 0 && (
              <Text style={styles.viewerCounter}>
                {viewerIndex + 1}/{orderedCommunityPhotos.length}
              </Text>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: textPrimary,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1E26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  heroWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    padding: 12,
  },
  heroName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  heroCity: {
    color: '#E5E7EB',
    marginTop: 4,
  },
  thumbRow: {
    marginTop: 12,
    gap: 8,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 8,
    opacity: 0.7,
  },
  thumbnailActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: primary,
  },
  titleSection: {
    marginTop: 16,
  },
  title: {
    color: textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: textSecondary,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: card,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    color: textPrimary,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1F26',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    color: '#FFF',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  favoriteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2C36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIconActive: {
    backgroundColor: primary,
    borderColor: primary,
  },
  primaryButton: {
    backgroundColor: primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  primaryButtonLabel: {
    color: '#FFF',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: primary,
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  secondaryButtonActive: {
    backgroundColor: primary,
  },
  secondaryButtonLabel: {
    color: primary,
    fontWeight: '700',
  },
  secondaryButtonLabelActive: {
    color: '#FFF',
  },
  sectionCard: {
    backgroundColor: card,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  postTile: {
    backgroundColor: '#11131B',
    borderRadius: 14,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 80,
  },
  myPhotoBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,15,69,0.85)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  myPhotoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    gap: 4,
  },
  emptyText: {
    color: textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    color: textSecondary,
    fontSize: 12,
  },
  sectionBody: {
    color: textSecondary,
    lineHeight: 20,
  },
  ratingSummary: {
    color: textSecondary,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  starButton: {
    paddingVertical: 4,
  },
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 32,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineButtonText: {
    color: primary,
    fontWeight: '700',
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  viewerContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  viewerImage: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  viewerImageContainer: {
    width: '100%',
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCounter: {
    marginTop: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    color: textPrimary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  tinyAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  tinyAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2A2C36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyUsername: {
    color: textSecondary,
    fontSize: 12,
    flex: 1,
  },
});
