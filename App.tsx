import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Wallet') {
                iconName = focused ? 'wallet' : 'wallet-outline';
              } else if (route.name === 'Messages') {
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              } else if (route.name === 'Swap') {
                iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              } else if (route.name === 'NFT') {
                iconName = focused ? 'diamond' : 'diamond-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else {
                iconName = 'ellipse';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textSecondary,
            tabBarStyle: {
              backgroundColor: Colors.surface,
              borderTopColor: 'transparent',
              borderTopWidth: 0,
              paddingBottom: 8,
              paddingTop: 8,
              height: 88,
              shadowColor: Colors.primary,
              shadowOffset: {
                width: 0,
                height: -4,
              },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            },
            tabBarItemStyle: {
              paddingVertical: 4,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            },
            headerStyle: {
              backgroundColor: Colors.surface,
              shadowColor: 'transparent',
              elevation: 0,
            },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          })}
        >
          <Tab.Screen 
            name="Wallet" 
            component={EnhancedWalletScreen}
            options={{ 
              headerShown: false,
              tabBarLabel: 'Wallet',
            }}
          />
          <Tab.Screen 
            name="Messages" 
            component={MessagesScreen}
            options={{ 
              headerShown: false,
              tabBarLabel: 'Messages',
            }}
          />
          <Tab.Screen 
            name="Swap" 
            component={SwapScreen}
            options={{ 
              headerShown: false,
              tabBarLabel: 'Swap',
            }}
          />
          <Tab.Screen 
            name="NFT" 
            component={NFTScreen}
            options={{ 
              headerShown: false,
              tabBarLabel: 'NFTs',
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={EnhancedSettingsScreen}
            options={{ 
              headerShown: false,
              tabBarLabel: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 