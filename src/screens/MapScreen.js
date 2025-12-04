import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterChips from '../components/FilterChips';
import SpotPreviewSheet from '../components/SpotPreviewSheet';
import { useSpots } from '../context/SpotsContext';
import { background, primary, textSecondary } from '../theme/colors';
import { chooseNavigationApp } from '../utils/navigationUtils';

const ANDROID_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const typeFilters = [
  { label: 'All', id: 'all' },
  { label: 'Rooftop', id: 'rooftop' },
  { label: 'Industrial', id: 'industrial' },
  { label: 'Parking', id: 'parking' },
  { label: 'Nature', id: 'nature' },
  { label: 'Tunnel', id: 'tunnel' },
];

export default function MapScreen({ navigation }) {
  const { spots, activeTypeFilter, setActiveTypeFilter, getShotCount, getSpotRating } = useSpots();
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [androidMarkerReady, setAndroidMarkerReady] = useState(Platform.OS !== 'android');
  const [androidTracksView, setAndroidTracksView] = useState(Platform.OS === 'android');
  const insets = useSafeAreaInsets();

  const filteredSpots = useMemo(() => {
    if (activeTypeFilter === 'all') {
      return spots;
    }
    return spots.filter((spot) => spot.type === activeTypeFilter);
  }, [spots, activeTypeFilter]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedSpot) {
        setSelectedSpot(null);
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [selectedSpot]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const readyTimer = setTimeout(() => setAndroidMarkerReady(true), 250);
    return () => clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const trackTimer = setTimeout(() => setAndroidTracksView(false), 300);
    return () => clearTimeout(trackTimer);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: 42.6977,
          longitude: 23.3219,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        onPress={() => setSelectedSpot(null)}
        customMapStyle={Platform.OS === 'android' ? ANDROID_STYLE : []}
        showsCompass={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsPointsOfInterest={Platform.OS === 'android' ? false : true}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        onMapReady={() => {
          setTimeout(() => setMapReady(true), 200);
        }}
      >
        {mapReady && (Platform.OS !== 'android' || androidMarkerReady) && filteredSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.lat, longitude: spot.lng }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={(event) => {
              event.stopPropagation();
              setSelectedSpot(spot);
            }}
            tracksViewChanges={Platform.OS === 'android' ? androidTracksView : false}
          >
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.filterOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Филтрирай SPOT-овете</Text>
          <FilterChips
            types={typeFilters}
            activeTypeId={activeTypeFilter}
            onTypeChange={setActiveTypeFilter}
          />
        </View>
      </View>

      <SpotPreviewSheet
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        onNavigate={() => {
          if (selectedSpot) {
            chooseNavigationApp(selectedSpot.lat, selectedSpot.lng, selectedSpot.name);
          }
        }}
        onDetails={() => {
          if (selectedSpot) {
            navigation.getParent()?.navigate('SpotDetails', { spot: selectedSpot });
            setSelectedSpot(null);
          }
        }}
        getShotCount={getShotCount}
        getSpotRating={getSpotRating}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  filterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  filterHeader: {
    backgroundColor: 'rgba(5,6,10,0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTitle: {
    color: textSecondary,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  markerOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
});
