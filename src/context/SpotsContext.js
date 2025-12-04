import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mockSpots from '../data/mockSpots';
import { updateUserProfile, getUserProfile } from '../storage/userProfile';

const SpotsContext = createContext(null);
const USER_CITY_KEY = 'spotr.userCity';

export function SpotsProvider({ children }) {
  const [spots, setSpots] = useState(mockSpots);
  const [favorites, setFavorites] = useState([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [userCity, setUserCityState] = useState('Sofia');
  const [shotsBySpotId, setShotsBySpotId] = useState({});
  const [userShotSpots, setUserShotSpots] = useState([]);
  const [commentsBySpotId, setCommentsBySpotId] = useState({});
  const [ratingsBySpotId, setRatingsBySpotId] = useState({});
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadCity = async () => {
      try {
        const storedCity = await AsyncStorage.getItem(USER_CITY_KEY);
        if (storedCity) {
          setUserCityState(storedCity);
        }
      } catch (error) {
        console.warn('Failed to load city', error);
      }
    };

    loadCity();
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const profile = await getUserProfile();
      if (isMounted) {
        setUserProfile(profile);
        setFavorites(profile.favorites || []);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFavorite = useCallback(async (spotId) => {
    let nextFavorites = [];
    setFavorites((prev) => {
      nextFavorites = prev.includes(spotId)
        ? prev.filter((id) => id !== spotId)
        : [...prev, spotId];
      return nextFavorites;
    });
    const profile = await getUserProfile();
    const updated = await updateUserProfile({ ...profile, favorites: nextFavorites });
    setUserProfile(updated);
  }, []);

  const addSpot = useCallback(
    (spotPayload) => {
      const normalizedSpot = {
        ...spotPayload,
        id: spotPayload.id || `spot-${Date.now()}`,
        thumbnail:
          spotPayload.thumbnail ||
          'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d',
        shortDescription:
          spotPayload.shortDescription || 'Нов SPOTR запис, добавен за преглед от екипа.',
        city: spotPayload.city || userCity,
      };

      setSpots((prev) => [normalizedSpot, ...prev]);
    },
    [userCity],
  );

  const setUserCity = useCallback(async (city) => {
    setUserCityState(city);
    try {
      await AsyncStorage.setItem(USER_CITY_KEY, city);
    } catch (error) {
      console.warn('Failed to persist city', error);
    }
  }, []);

  const toggleShot = useCallback(
    (spotId) => {
      const hasShot = userShotSpots.includes(spotId);
      setUserShotSpots((prev) =>
        hasShot ? prev.filter((id) => id !== spotId) : [...prev, spotId],
      );
      setShotsBySpotId((prev) => {
        const current = prev[spotId] || 0;
        const nextValue = hasShot ? Math.max(0, current - 1) : current + 1;
        return { ...prev, [spotId]: nextValue };
      });
    },
    [userShotSpots],
  );

  const addComment = useCallback((spotId, text) => {
    if (!text?.trim()) {
      return;
    }
    const newComment = {
      id: Date.now().toString(),
      author: 'Гост драйвър',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setCommentsBySpotId((prev) => {
      const existing = prev[spotId] || [];
      return {
        ...prev,
        [spotId]: [newComment, ...existing],
      };
    });
  }, []);

  const addRating = useCallback((spotId, value) => {
    if (value < 1 || value > 5) {
      return;
    }
    setRatingsBySpotId((prev) => {
      const current = prev[spotId] || { sum: 0, count: 0 };
      return {
        ...prev,
        [spotId]: {
          sum: current.sum + value,
          count: current.count + 1,
        },
      };
    });
  }, []);

  const getShotCount = useCallback(
    (spotId) => shotsBySpotId[spotId] || 0,
    [shotsBySpotId],
  );

  const hasUserShotHere = useCallback(
    (spotId) => userShotSpots.includes(spotId),
    [userShotSpots],
  );

  const getSpotRating = useCallback(
    (spotId) => {
      const entry = ratingsBySpotId[spotId];
      if (!entry || entry.count === 0) {
        return { average: null, count: 0 };
      }
      return {
        average: entry.sum / entry.count,
        count: entry.count,
      };
    },
    [ratingsBySpotId],
  );

  const addUserPhoto = useCallback(
    async (spotId, uri) => {
      const profile = await getUserProfile();
      const filtered = (profile.photos || []).filter((item) => item.spotId !== spotId);
      const nextPhotos = [
        { spotId, uri, createdAt: new Date().toISOString() },
        ...filtered,
      ];
      const updated = await updateUserProfile({ ...profile, photos: nextPhotos });
      setUserProfile(updated);
    },
    [],
  );

  const value = useMemo(
    () => ({
      spots,
      favorites,
      toggleFavorite,
      addSpot,
      activeTypeFilter,
      setActiveTypeFilter,
      userCity,
      setUserCity,
      shotsBySpotId,
      userShotSpots,
      commentsBySpotId,
      ratingsBySpotId,
      toggleShot,
      addComment,
      addRating,
      getSpotRating,
      getShotCount,
      hasUserShotHere,
      userProfile,
      addUserPhoto,
    }),
    [
      spots,
      favorites,
      toggleFavorite,
      addSpot,
      activeTypeFilter,
      userCity,
      setUserCity,
      shotsBySpotId,
      userShotSpots,
      commentsBySpotId,
      ratingsBySpotId,
      toggleShot,
      addComment,
      addRating,
      getSpotRating,
      getShotCount,
      hasUserShotHere,
      userProfile,
      addUserPhoto,
    ],
  );

  return <SpotsContext.Provider value={value}>{children}</SpotsContext.Provider>;
}

export const useSpots = () => {
  const context = useContext(SpotsContext);
  if (!context) {
    throw new Error('useSpots must be used within a SpotsProvider');
  }
  return context;
};
