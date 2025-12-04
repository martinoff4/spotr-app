import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { getUserProfile, updateUserProfile } from '../../storage/userProfile';
import { background, card, primary, textPrimary, textSecondary } from '../../theme/colors';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [usernameModal, setUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        setLoading(true);
        const data = await getUserProfile();
        if (isActive) {
          setProfile(data);
          setUsernameInput(data.username || '');
          setLoading(false);
        }
      })();
      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleChangeAvatar = async () => {
    if (!profile || avatarLoading) return;
    setAvatarLoading(true);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setAvatarLoading(false);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      const updated = await updateUserProfile({ avatar: uri });
      setProfile(updated);
    }
    setAvatarLoading(false);
  };

  const handleSaveUsername = async () => {
    if (!profile) return;
    const nextUsername = usernameInput.trim() || 'Spotr User';
    const updated = await updateUserProfile({ username: nextUsername });
    setProfile(updated);
    setUsernameModal(false);
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalPhotos = profile.photos?.length || 0;
  const spotsVisited = new Set(profile.photos?.map((item) => item.spotId)).size;
  const favoritesCount = profile.favorites?.length || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleChangeAvatar}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={28} color={textSecondary} />
              </View>
            )}
            {avatarLoading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.usernameRow} onPress={() => setUsernameModal(true)}>
            <Text style={styles.username}>{profile.username || 'Spotr User'}</Text>
            <Feather name="edit-2" size={16} color={textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <StatItem label="Кадри" value={totalPhotos} />
          <StatItem label="Spots" value={spotsVisited} />
          <StatItem label="Любими" value={favoritesCount} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Photos</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>Няма качени снимки</Text>
            <Text style={styles.placeholderSubtitle}>Добави кадри чрез “Снимал съм тук”.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Favorites</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>Любими места</Text>
            <Text style={styles.placeholderSubtitle}>Тук ще виждаш любимите си SPOT-ове.</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={usernameModal} transparent animationType="fade" onRequestClose={() => setUsernameModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Редактирай име</Text>
            <TextInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="Въведи име"
              placeholderTextColor="#9CA3AF"
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setUsernameModal(false)}>
                <Text style={styles.modalButtonText}>Отказ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleSaveUsername}>
                <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Запази</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const StatItem = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: '#1F2027',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    color: textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: card,
    borderRadius: 18,
    paddingVertical: 20,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: textSecondary,
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  placeholderCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2027',
    padding: 16,
    backgroundColor: '#0F1117',
  },
  placeholderTitle: {
    color: textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholderSubtitle: {
    color: textSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: card,
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    color: textPrimary,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#1F2027',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: textPrimary,
    borderWidth: 1,
    borderColor: '#262835',
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalButtonText: {
    color: textSecondary,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    backgroundColor: primary,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  modalButtonPrimaryText: {
    color: '#FFF',
  },
});
