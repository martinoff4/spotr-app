import AsyncStorage from '@react-native-async-storage/async-storage';

const VOTES_STORAGE_KEY = 'spotr:mediaVotes';

export async function getAllMediaVotes() {
  try {
    const stored = await AsyncStorage.getItem(VOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (_error) {
    // ignore and fall back
  }
  return {};
}

export async function getMediaVote(mediaId) {
  if (!mediaId) return 0;
  try {
    const allVotes = await getAllMediaVotes();
    return allVotes[mediaId] || 0;
  } catch (_error) {
    return 0;
  }
}

export async function setMediaVote(mediaId, voteValue) {
  if (!mediaId) return {};
  // voteValue must be -1, 0, or 1
  const safeValue = [-1, 0, 1].includes(voteValue) ? voteValue : 0;

  try {
    const allVotes = await getAllMediaVotes();
    const updated = { ...allVotes, [mediaId]: safeValue };
    
    // Clean up 0 values to save space, optionally, but for now keep it simple
    await AsyncStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (_error) {
    return {};
  }
}

