import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'spotr:userProfile';

const createDefaultProfile = () => ({
  id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  username: 'Spotr User',
  avatar: null,
  photos: [],
  favorites: [],
});

export async function getUserProfile() {
  try {
    const stored = await AsyncStorage.getItem(PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (_error) {
    // ignore parsing errors and fall back to default profile
  }
  const profile = createDefaultProfile();
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (_error) {
    // ignore persist errors; return in-memory profile
  }
  return profile;
}

export async function updateUserProfile(partialData) {
  const current = await getUserProfile();
  const updated = { ...current, ...partialData };
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
  } catch (_error) {
    // ignore persist errors; still return updated object
  }
  return updated;
}

export async function resetUserProfile() {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (_error) {
    // ignore removal errors
  }
}
