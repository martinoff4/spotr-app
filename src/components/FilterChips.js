import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { card, primary, textSecondary } from '../theme/colors';

export default function FilterChips({ types = [], activeTypeId = 'all', onTypeChange }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {types.map((type, index) => {
          const isActive = activeTypeId === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.chip,
                isActive && styles.chipActive,
                index === types.length - 1 && styles.lastChip,
              ]}
              onPress={() => onTypeChange?.(type.id)}
            >
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 4,
  },
  row: {
    paddingHorizontal: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2027',
    backgroundColor: card,
    marginRight: 12,
  },
  lastChip: {
    marginRight: 0,
  },
  chipActive: {
    backgroundColor: primary,
    borderColor: primary,
  },
  chipLabel: {
    color: textSecondary,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  chipLabelActive: {
    color: '#FFF',
    fontWeight: '700',
  },
});
