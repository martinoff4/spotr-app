import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { background, card, primary, textPrimary, textSecondary } from '../theme/colors';
import { useSpots } from '../context/SpotsContext';

export default function CommentsScreen({ route }) {
  const spotId = route.params?.spotId;
  const { spots, commentsBySpotId, addComment } = useSpots();
  const [text, setText] = useState('');

  const comments = commentsBySpotId[spotId] || [];
  const spot = useMemo(() => spots.find((item) => item.id === spotId), [spots, spotId]);

  const handlePublish = () => {
    if (!text.trim()) {
      return;
    }
    addComment(spotId, text.trim());
    setText('');
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('bg-BG');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Feather name="message-circle" size={18} color={textSecondary} />
          <Text style={styles.headerTitle}>
            Коментари {spot ? `• ${spot.name}` : ''}
          </Text>
        </View>

        {comments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Все още няма коментари. Бъди първият, който споделя опит.
            </Text>
          </View>
        ) : (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
              </View>
              <Text style={styles.commentBody}>{comment.text}</Text>
            </View>
          ))
        )}

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Добави коментар</Text>
          <TextInput
            style={styles.input}
            placeholder="Сподели как мина снимането тук…"
            placeholderTextColor="#6B7280"
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishLabel}>Публикувай</Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerTitle: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: card,
  },
  emptyText: {
    color: textSecondary,
    textAlign: 'center',
  },
  commentCard: {
    backgroundColor: card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    color: textPrimary,
    fontWeight: '600',
  },
  commentDate: {
    color: textSecondary,
    fontSize: 12,
  },
  commentBody: {
    color: textSecondary,
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  inputLabel: {
    color: textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F1117',
    borderRadius: 12,
    padding: 10,
    color: textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  publishButton: {
    backgroundColor: primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  publishLabel: {
    color: '#FFF',
    fontWeight: '700',
  },
});
