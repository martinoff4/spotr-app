import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = 'spotMedia:';

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

export const addSpotMedia = async (spotId, items) => {
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
