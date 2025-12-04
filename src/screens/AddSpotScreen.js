import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { background, card, primary, textPrimary, textSecondary } from '../theme/colors';
import { useSpots } from '../context/SpotsContext';

const spotTypes = ['rooftop', 'industrial', 'parking', 'nature', 'tunnel'];

export default function AddSpotScreen({ navigation }) {
  const { addSpot, userCity } = useSpots();
  const [form, setForm] = useState({
    name: '',
    city: userCity,
    type: 'rooftop',
    bestTime: 'night',
    notes: '',
    lat: '42.6977',
    lng: '23.3219',
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert('Име липсва', 'Въведи име на локацията.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      city: form.city.trim() || userCity,
      type: form.type,
      bestTime: form.bestTime || 'night',
      notes: form.notes,
      riskLevel: 'low',
      lat: parseFloat(form.lat) || 42.6977,
      lng: parseFloat(form.lng) || 23.3219,
      shortDescription:
        form.notes.trim() || 'Нова локация, предложена за ревю от общността.',
    };

    addSpot(payload);
    Alert.alert('Submitted for review', 'SPOTR екипът ще прегледа тази локация скоро.');
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Име</Text>
        <TextInput
          style={styles.input}
          placeholder="Sunset rooftop"
          placeholderTextColor={textSecondary}
          value={form.name}
          onChangeText={(value) => updateField('name', value)}
        />

        <Text style={styles.label}>Град</Text>
        <TextInput
          style={styles.input}
          placeholder="Sofia"
          placeholderTextColor={textSecondary}
          value={form.city}
          onChangeText={(value) => updateField('city', value)}
        />

        <Text style={styles.label}>Тип локация</Text>
        <View style={styles.segment}>
          {spotTypes.map((type) => {
            const isActive = form.type === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.segmentItem, isActive && styles.segmentItemActive]}
                onPress={() => updateField('type', type)}
              >
                <Text style={[styles.segmentLabel, isActive && styles.segmentLabelActive]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Най-добро време</Text>
        <TextInput
          style={styles.input}
          placeholder="Golden hour"
          placeholderTextColor={textSecondary}
          value={form.bestTime}
          onChangeText={(value) => updateField('bestTime', value)}
        />

        <Text style={styles.label}>Бележки</Text>
        <TextInput
          style={[styles.input, styles.notes]}
          placeholder="Какво да носим, на какво да внимаваме..."
          placeholderTextColor={textSecondary}
          value={form.notes}
          onChangeText={(value) => updateField('notes', value)}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Координати</Text>
        <View style={styles.coordRow}>
          <View style={styles.coordField}>
            <Text style={styles.coordLabel}>Lat</Text>
            <TextInput
              style={styles.input}
              placeholder="42.6977"
              placeholderTextColor={textSecondary}
              value={form.lat}
              onChangeText={(value) => updateField('lat', value)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.coordField}>
            <Text style={styles.coordLabel}>Lng</Text>
            <TextInput
              style={styles.input}
              placeholder="23.3219"
              placeholderTextColor={textSecondary}
              value={form.lng}
              onChangeText={(value) => updateField('lng', value)}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.9}>
        <Text style={styles.submitLabel}>Запази за по-късно</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
  content: {
    padding: 24,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: card,
    borderRadius: 20,
    padding: 20,
  },
  label: {
    color: textPrimary,
    fontWeight: '600',
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1F2027',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: textPrimary,
    marginTop: 8,
  },
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  segmentItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2027',
  },
  segmentItemActive: {
    backgroundColor: primary,
    borderColor: primary,
  },
  segmentLabel: {
    color: textSecondary,
    textTransform: 'capitalize',
  },
  segmentLabelActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  notes: {
    height: 120,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordField: {
    flex: 1,
  },
  coordLabel: {
    color: textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitLabel: {
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
