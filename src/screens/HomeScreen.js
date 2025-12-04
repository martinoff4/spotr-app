import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SpotCard from '../components/SpotCard';
import FilterChips from '../components/FilterChips';
import { background, primary, textPrimary, textSecondary, card } from '../theme/colors';
import { useSpots } from '../context/SpotsContext';

const typeFilters = [
  { label: 'All', id: 'all' },
  { label: 'Rooftop', id: 'rooftop' },
  { label: 'Industrial', id: 'industrial' },
  { label: 'Parking', id: 'parking' },
  { label: 'Nature', id: 'nature' },
  { label: 'Tunnel', id: 'tunnel' },
];

export default function HomeScreen({ navigation }) {
  const { spots, favorites, toggleFavorite, userCity, activeTypeFilter, setActiveTypeFilter } =
    useSpots();

  const filteredSpots = useMemo(() => {
    if (activeTypeFilter === 'all') return spots;
    return spots.filter((spot) => spot.type === activeTypeFilter);
  }, [spots, activeTypeFilter]);

  const renderSpot = ({ item }) => (
    <SpotCard
      spot={item}
      isFavorite={favorites.includes(item.id)}
      onToggleFavorite={toggleFavorite}
      onPress={() => navigation.getParent()?.navigate('SpotDetails', { spot: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        renderItem={renderSpot}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.subtitle}>Текущ град</Text>
                <Text style={styles.title}>{userCity}</Text>
              </View>
              <Ionicons name="speedometer" color={primary} size={28} />
            </View>
            <View style={styles.filterWrapper}>
              <FilterChips
                types={typeFilters}
                activeTypeId={activeTypeFilter}
                onTypeChange={setActiveTypeFilter}
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Няма SPOT-ове за този филтър.</Text>
            <Text style={styles.emptySubtitle}>Пробвай друг тип или добави ново място.</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.getParent()?.navigate('AddSpot')}
            >
              <Text style={styles.emptyButtonLabel}>Добави SPOT</Text>
            </TouchableOpacity>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => navigation.getParent()?.navigate('AddSpot')}>
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.fabLabel}>Add spot</Text>
      </TouchableOpacity>
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
  listContent: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterWrapper: {
    marginBottom: 20,
  },
  subtitle: {
    color: textSecondary,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: primary,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  fabLabel: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    color: textPrimary,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: textSecondary,
    marginBottom: 12,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: primary,
  },
  emptyButtonLabel: {
    color: primary,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
