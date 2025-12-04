import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { background, card, primary, textPrimary } from './src/theme/colors';
import { SpotsProvider } from './src/context/SpotsContext';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary,
    background,
    card,
    text: textPrimary,
    border: '#1C1D23',
  },
};

export default function App() {
  return (
    <SpotsProvider>
      <SafeAreaView style={styles.container}>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaView>
    </SpotsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: background,
  },
});
