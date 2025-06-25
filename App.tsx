import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EnhancedTabBar } from './src/components/EnhancedTabBar';

import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RealWalletOnboarding from './src/screens/RealWalletOnboarding';
import EnhancedWalletScreen from './src/screens/EnhancedWalletScreen';
import EnhancedSettingsScreen from './src/screens/EnhancedSettingsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import SwapScreen from './src/screens/SwapScreen';
import NFTScreen from './src/screens/NFTScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Colors } from './src/constants/Colors';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Simulate checking if user has seen onboarding
  useEffect(() => {
    // In a real app, you'd check AsyncStorage here
    // For demo purposes, we'll always show onboarding on first load
  }, []);

  if (isLoading) {
    return <LoadingScreen onFinish={() => setIsLoading(false)} />;
  }

  if (isFirstLaunch) {
    return <RealWalletOnboarding onComplete={() => setIsFirstLaunch(false)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: Colors.primary,
            background: Colors.background,
            card: Colors.surface,
            text: Colors.text,
            border: Colors.border,
            notification: Colors.accent,
          },
        }}
      >
        <StatusBar style="light" backgroundColor={Colors.background} />
        <Tab.Navigator
          tabBar={(props) => <EnhancedTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen name="Wallet" component={EnhancedWalletScreen} />
          <Tab.Screen name="Messages" component={MessagesScreen} />
          <Tab.Screen name="Swap" component={SwapScreen} />
          <Tab.Screen name="NFT" component={NFTScreen} />
          <Tab.Screen name="Settings" component={EnhancedSettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 