import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { background, card, primary, textPrimary, textSecondary } from '../../theme/colors';

export default function PublicProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();

  // Params or fallbacks
  const { userId, username, avatar, photos } = route.params || {};

  // Fallback user generation
  const displayUsername = username || 'Spotr User';
  const displayAvatar = avatar || null; // If null, render placeholder
  const displayPhotos = Array.isArray(photos) ? photos : [];

  // Stats
  const photoCount = displayPhotos.length;
  const uniqueSpots = new Set(displayPhotos.map((p) => p.spotId)).size;

  // Grid layout
  const columns = 3;
  const gap = 2;
  const itemWidth = (width - (columns - 1) * gap) / columns;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {displayAvatar ? (
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={40} color={textSecondary} />
              </View>
            )}
          </View>
          <Text style={styles.username}>{displayUsername}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{photoCount}</Text>
              <Text style={styles.statLabel}>Снимки</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{uniqueSpots}</Text>
              <Text style={styles.statLabel}>Спотове</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Снимки</Text>
          {displayPhotos.length > 0 ? (
            <View style={styles.grid}>
              {displayPhotos.map((photo, index) => (
                <View
                  key={photo.id || index}
                  style={[
                    styles.gridItem,
                    {
                      width: itemWidth,
                      height: itemWidth,
                      marginBottom: gap,
                      marginRight: (index + 1) % columns === 0 ? 0 : gap,
                    },
                  ]}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Няма снимки</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  content: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2027',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2027',
  },
  username: {
    color: textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: card,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: textPrimary,
    fontSize: 20,
    fontWeight: '700',
    color: '#FF0F45', // Accent color
  },
  statLabel: {
    color: textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#2A2C36',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    backgroundColor: card,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: textSecondary,
  },
});

