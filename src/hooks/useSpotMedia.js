import { useEffect, useState, useCallback } from 'react';
import { addSpotMedia, getSpotMedia } from '../store/spotMediaStore';

export function useSpotMedia(spotId) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!spotId) {
      setMedia([]);
      setLoading(false);
      return;
    }
    const items = await getSpotMedia(spotId);
    setMedia(items);
    setLoading(false);
  }, [spotId]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    if (!spotId) {
      setMedia([]);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }
    (async () => {
      const items = await getSpotMedia(spotId);
      if (isMounted) {
        setMedia(items);
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [spotId]);

  const addItems = async (uris) => {
    if (!spotId) return;
    if (!uris?.length) return;
    const next = await addSpotMedia(
      spotId,
      uris.map((uri) => ({ uri })),
    );
    setMedia(next);
  };

  return { media, loading, refresh, addItems };
}
