import AsyncStorage from '@react-native-async-storage/async-storage';
import mockSpots from '../data/mockSpots';

const STORAGE_KEY_PREFIX = 'spotMedia:';

export const getAllSpotMedia = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mediaKeys = keys.filter((key) => key.startsWith(STORAGE_KEY_PREFIX));
    if (!mediaKeys.length) return [];

    const pairs = await AsyncStorage.multiGet(mediaKeys);
    let allMedia = [];

    pairs.forEach(([key, value]) => {
      if (value) {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          allMedia = [...allMedia, ...parsed];
        }
      }
    });

    // Sort by createdAt descending
    return allMedia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.warn('Failed to get all spot media', error);
    return [];
  }
};

export const getAllSpotsWithMediaCount = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mediaKeys = keys.filter((key) => key.startsWith(STORAGE_KEY_PREFIX));
    
    const counts = {}; // spotId -> count

    if (mediaKeys.length > 0) {
      const pairs = await AsyncStorage.multiGet(mediaKeys);
      pairs.forEach(([key, value]) => {
        if (value) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const spotId = key.replace(STORAGE_KEY_PREFIX, '');
            counts[spotId] = parsed.length;
          }
        }
      });
    }

    // Map spots to include count
    const spotsWithCount = mockSpots.map((spot) => ({
      spot,
      count: counts[spot.id] || 0,
    }));

    // Sort descending by count
    return spotsWithCount.sort((a, b) => b.count - a.count);
  } catch (error) {
    console.warn('Failed to get spots with media count', error);
    return [];
  }
};

export const getSpotMedia = async (spotId) => {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${spotId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load media', error);
    return [];
  }
};

const createId = () => `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const addSpotMedia = async (spotId, items, userInfo = {}) => {
  if (!spotId || !Array.isArray(items) || items.length === 0) {
    return getSpotMedia(spotId);
  }
  const current = await getSpotMedia(spotId);
  const next = [
    ...items.map((item) => ({
      id: createId(),
      spotId,
      uri: item.uri,
      createdAt: new Date().toISOString(),
      userId: userInfo.userId || null,
      username: userInfo.username || 'Spotr User',
      avatar: userInfo.avatar || null,
    })),
    ...current,
  ];
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${spotId}`, JSON.stringify(next));
  } catch (error) {
    console.warn('Failed to save media', error);
  }
  return next;
};

export const clearAllSpotMedia = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mediaKeys = keys.filter((key) => key.startsWith(STORAGE_KEY_PREFIX));
    if (mediaKeys.length) {
      await AsyncStorage.multiRemove(mediaKeys);
    }
  } catch (error) {
    console.warn('Failed to clear media', error);
  }
};
