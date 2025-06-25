import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabConfig {
  name: string;
  focusedIcon: string;
  unfocusedIcon: string;
  label: string;
  gradient: string[];
  glowColor: string;
}

const tabConfigs: { [key: string]: TabConfig } = {
  Wallet: {
    name: 'Wallet',
    focusedIcon: 'wallet',
    unfocusedIcon: 'wallet-outline',
    label: 'Wallet',
    gradient: [Colors.primary, Colors.accent],
    glowColor: Colors.primary,
  },
  Messages: {
    name: 'Messages',
    focusedIcon: 'chatbubbles',
    unfocusedIcon: 'chatbubbles-outline',
    label: 'Messages',
    gradient: [Colors.accent, Colors.primaryLight],
    glowColor: Colors.accent,
  },
  Swap: {
    name: 'Swap',
    focusedIcon: 'swap-horizontal',
    unfocusedIcon: 'swap-horizontal-outline',
    label: 'Swap',
    gradient: [Colors.success, '#00A844'],
    glowColor: Colors.success,
  },
  NFT: {
    name: 'NFT',
    focusedIcon: 'diamond',
    unfocusedIcon: 'diamond-outline',
    label: 'NFTs',
    gradient: [Colors.warning, '#FF6B35'],
    glowColor: Colors.warning,
  },
  Settings: {
    name: 'Settings',
    focusedIcon: 'settings',
    unfocusedIcon: 'settings-outline',
    label: 'Settings',
    gradient: [Colors.primaryLight, Colors.primary],
    glowColor: Colors.primaryLight,
  },
};

export const EnhancedTabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const animatedValues = useRef(
    state.routes.map(() => ({
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(0.7),
      glow: new Animated.Value(0),
      bounce: new Animated.Value(0),
      shimmer: new Animated.Value(0),
    }))
  ).current;

  const backgroundShimmer = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundShimmer, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundShimmer, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Initialize tab animations
    animatedValues.forEach((anim: any, index: number) => {
      if (index === state.index) {
        animateTabActive(index);
      } else {
        animateTabInactive(index);
      }
    });
  }, []);

  useEffect(() => {
    animatedValues.forEach((anim: any, index: number) => {
      if (index === state.index) {
        animateTabActive(index);
      } else {
        animateTabInactive(index);
      }
    });
  }, [state.index]);

  const animateTabActive = (index: number) => {
    const anim = animatedValues[index];
    
    Animated.parallel([
      // Scale up
      Animated.spring(anim.scale, {
        toValue: 1.2,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Move up
      Animated.spring(anim.translateY, {
        toValue: -8,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Full opacity
      Animated.timing(anim.opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // Glow effect
      Animated.timing(anim.glow, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Bounce effect
    Animated.sequence([
      Animated.timing(anim.bounce, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(anim.bounce, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim.shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.shimmer, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateTabInactive = (index: number) => {
    const anim = animatedValues[index];
    
    Animated.parallel([
      // Scale down
      Animated.spring(anim.scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Move to normal position
      Animated.spring(anim.translateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Reduced opacity
      Animated.timing(anim.opacity, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      // No glow
      Animated.timing(anim.glow, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onTabPress = (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      // Haptic feedback would go here
      navigation.navigate(route.name);
    }
  };

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const config = tabConfigs[route.name];
    const anim = animatedValues[index];

    if (!config) return null;



    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tab}
        onPress={() => onTabPress(route, index)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [
                { scale: anim.scale },
                { translateY: anim.translateY },
                {
                  rotate: anim.bounce.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '5deg'],
                  }),
                },
              ],
              opacity: anim.opacity,
            },
          ]}
        >
          {/* Glow Effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: anim.glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
                shadowColor: config.glowColor,
              },
            ]}
          />

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            {isFocused ? (
              <LinearGradient
                colors={config.gradient}
                style={styles.activeIconBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <BlurView intensity={20} style={styles.iconBlur}>
                  <Ionicons
                    name={config.focusedIcon as any}
                    size={20}
                    color={Colors.text}
                  />
                  
                  {/* Shimmer overlay */}
                  <Animated.View
                    style={[
                      styles.shimmerOverlay,
                      {
                        opacity: anim.shimmer.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.6],
                        }),
                        transform: [
                          {
                            translateX: anim.shimmer.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-50, 50],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </BlurView>
              </LinearGradient>
            ) : (
              <View style={styles.inactiveIconBackground}>
                <Ionicons
                  name={config.unfocusedIcon as any}
                  size={20}
                  color={Colors.textSecondary}
                />
              </View>
            )}
          </View>

          {/* Label */}
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                color: isFocused ? config.glowColor : Colors.textSecondary,
                fontWeight: isFocused ? '700' : '500',
                transform: [
                  {
                    scale: isFocused ? 1.05 : 1,
                  },
                ],
              },
            ]}
          >
            {config.label}
          </Animated.Text>

          {/* Active indicator dot */}
          {isFocused && (
            <Animated.View
              style={[
                styles.activeDot,
                {
                  backgroundColor: config.glowColor,
                  transform: [
                    {
                      scale: anim.bounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Floating background particles */}
      <Animated.View
        style={[
          styles.floatingParticle,
          {
            transform: [
              {
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
            opacity: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
          },
        ]}
      />

      {/* Main tab bar */}
      <LinearGradient
        colors={[
          Colors.background + 'E6',
          Colors.surface + 'F0',
          Colors.backgroundSecondary + 'E6',
        ]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <BlurView intensity={100} style={styles.blurContainer}>
          {/* Background shimmer */}
          <Animated.View
            style={[
              styles.backgroundShimmer,
              {
                opacity: backgroundShimmer.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.1],
                }),
                transform: [
                  {
                    translateX: backgroundShimmer.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-width, width],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {state.routes.map((route: any, index: number) => renderTab(route, index))}
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  floatingParticle: {
    position: 'absolute',
    top: -20,
    left: width * 0.3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  gradient: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 12,
  },
  blurContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  backgroundShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 2,
    position: 'relative',
  },
  activeIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  iconBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.text,
    opacity: 0.3,
  },
  inactiveIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
  },
  activeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 1,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
}); 