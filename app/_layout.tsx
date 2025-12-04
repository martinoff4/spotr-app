import React from 'react';
import 'react-native-reanimated';
import { NavigationIndependentTree } from '@react-navigation/native';
import App from '../App';

export default function RootLayout() {
  return (
    <NavigationIndependentTree>
      <App />
    </NavigationIndependentTree>
  );
}
