import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SpotDetailsScreen from '../screens/SpotDetailsScreen';
import AddSpotScreen from '../screens/AddSpotScreen';
import CitySelectScreen from '../screens/CitySelectScreen';
import CommentsScreen from '../screens/CommentsScreen';
import RateSpotScreen from '../screens/RateSpotScreen';
import { background, card, primary, textPrimary, textSecondary } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: 'compass',
  Map: 'map',
  Favorites: 'heart',
  Profile: 'person',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: card,
          borderTopColor: '#1C1D23',
        },
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = tabIcons[route.name] || 'radio';
          return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: background },
        headerTintColor: textPrimary,
        headerTitleStyle: { color: textPrimary },
        contentStyle: { backgroundColor: background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="SpotDetails"
        component={SpotDetailsScreen}
        options={{ title: 'Spot details', headerBackTitle: 'Назад' }}
      />
      <Stack.Screen name="AddSpot" options={{ title: 'Add spot' }} component={AddSpotScreen} />
      <Stack.Screen
        name="CitySelect"
        component={CitySelectScreen}
        options={{ title: 'Избери град', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ title: 'Коментари' }}
      />
      <Stack.Screen
        name="RateSpot"
        component={RateSpotScreen}
        options={{ title: 'Оцени мястото' }}
      />
    </Stack.Navigator>
  );
}
