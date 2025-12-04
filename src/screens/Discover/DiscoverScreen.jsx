import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { background, card, primary, textPrimary, textSecondary } from '../../theme/colors';
import { getAllSpotMedia, getAllSpotsWithMediaCount } from '../../store/spotMediaStore';
import mockSpots from '../../data/mockSpots';
import { getAllMediaVotes, setMediaVote } from '../../storage/mediaVotes';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80';

export default function DiscoverScreen() {
  const navigation = useNavigation();
  const [topSpots, setTopSpots] = useState([]);
  const [latestMedia, setLatestMedia] = useState([]);
  const [mediaVotes, setMediaVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [spotsData, mediaData, votesData] = await Promise.all([
      getAllSpotsWithMediaCount(),
      getAllSpotMedia(),
      getAllMediaVotes(),
    ]);

    setTopSpots(spotsData.slice(0, 10));
    setLatestMedia(mediaData.slice(0, 20));
    setMediaVotes(votesData);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToSpot = (spot) => {
    navigation.navigate('SpotDetails', { spot });
  };

  const navigateFromMedia = (mediaItem) => {
    const spot = mockSpots.find((s) => s.id === mediaItem.spotId);
    if (spot) {
      navigation.navigate('SpotDetails', { spot });
    }
  };

  const handleVote = async (mediaId, type) => {
    const currentVote = mediaVotes[mediaId] || 0;
    let newVote = 0;

    if (type === 'up') {
      newVote = currentVote === 1 ? 0 : 1;
    } else {
      newVote = currentVote === -1 ? 0 : -1;
    }

    const updatedVotes = await setMediaVote(mediaId, newVote);
    setMediaVotes(updatedVotes);
  };

  const renderTopSpotCard = ({ item }) => {
    const { spot, count } = item;
    const imageUri = spot.thumbnail || PLACEHOLDER_IMAGE;

    return (
      <TouchableOpacity
        style={styles.topSpotCard}
        onPress={() => navigateToSpot(spot)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUri }} style={styles.topSpotImage} />
        <View style={styles.topSpotOverlay}>
          <Text style={styles.topSpotName} numberOfLines={1}>
            {spot.name}
          </Text>
          <View style={styles.badge}>
            <Feather name="camera" size={10} color="#FFF" />
            <Text style={styles.badgeText}>{count} кадъра</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeedItem = ({ item }) => {
    const spot = mockSpots.find((s) => s.id === item.spotId);
    const spotName = spot ? spot.name : 'Непознат спот';
    
    const voteValue = mediaVotes[item.id] || 0;
    const isUpvoted = voteValue === 1;
    const isDownvoted = voteValue === -1;

    // Calculate relative time (simple version)
    const diff = Date.now() - new Date(item.createdAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    let timeLabel = 'току-що';
    if (days > 0) timeLabel = `преди ${days} дни`;
    else if (hours > 0) timeLabel = `преди ${hours} часа`;

    return (
      <View style={styles.feedCard}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigateFromMedia(item)}
          style={styles.feedImageWrapper}
        >
          <Image source={{ uri: item.uri }} style={styles.feedImage} />
        </TouchableOpacity>
        
        <View style={styles.feedContent}>
          <View style={styles.feedInfo}>
            <Text style={styles.feedSpotName} numberOfLines={1}>{spotName}</Text>
            <Text style={styles.feedTime}>{timeLabel}</Text>
          </View>

          <View style={styles.voteBar}>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote(item.id, 'up')}
              activeOpacity={0.7}
            >
              <Feather
                name="thumbs-up"
                size={20}
                color={isUpvoted ? '#FF0F45' : textSecondary}
              />
            </TouchableOpacity>
            
            <Text style={[
              styles.voteScore,
              isUpvoted && styles.scorePositive,
              isDownvoted && styles.scoreNegative
            ]}>
              {voteValue > 0 ? `+${voteValue}` : voteValue}
            </Text>

            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote(item.id, 'down')}
              activeOpacity={0.7}
            >
              <Feather
                name="thumbs-down"
                size={20}
                color={isDownvoted ? '#FF0F45' : textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderFeed = () => {
    if (loading) {
      return <View style={styles.loadingSpacer} />;
    }

    if (latestMedia.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Feather name="image" size={48} color={textSecondary} />
          <Text style={styles.emptyTitle}>Все още няма качени кадри.</Text>
          <Text style={styles.emptySubtitle}>
            Започни от картата или любимо място и добави първите снимки.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={latestMedia}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedItem}
        scrollEnabled={false} // Let the main ScrollView handle scrolling
        contentContainerStyle={styles.feedList}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Открий нови места</Text>
        <Text style={styles.headerSubtitle}>Виж къде хората снимат най-много.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Топ локации</Text>
            <Text style={styles.sectionDesc}>Места с най-много качени кадри.</Text>
          </View>

          <FlatList
            data={topSpots}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.spot.id}
            renderItem={renderTopSpotCard}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Последни кадри</Text>
            <Text style={styles.sectionDesc}>Най-новите снимки от всички места.</Text>
          </View>
          {renderFeed()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: {
    color: textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDesc: {
    color: textSecondary,
    fontSize: 13,
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  topSpotCard: {
    width: 160,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: card,
    position: 'relative',
  },
  topSpotImage: {
    width: '100%',
    height: '100%',
  },
  topSpotOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  topSpotName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0F45',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  loadingSpacer: {
    height: 200,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  feedList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  feedCard: {
    backgroundColor: card,
    borderRadius: 20,
    padding: 12,
    overflow: 'hidden',
  },
  feedImageWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  feedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  feedInfo: {
    flex: 1,
    marginRight: 16,
  },
  feedSpotName: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  feedTime: {
    color: textSecondary,
    fontSize: 12,
  },
  voteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1F26',
    borderRadius: 12,
    padding: 4,
  },
  voteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteScore: {
    color: textPrimary,
    fontWeight: '700',
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  scorePositive: {
    color: '#FF0F45',
  },
  scoreNegative: {
    color: '#FF0F45',
  },
});
