import React, { useRef, useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { responsive } from '../utils/responsive';

interface FloatingLogoProps {
  size?: number;
  onPress?: () => void;
  style?: any;
  showPulse?: boolean;
}

export const FloatingLogo: React.FC<FloatingLogoProps> = ({ 
  size = 56, 
  onPress, 
  style,
  showPulse = true 
}) => {
  const [screenData, setScreenData] = useState(responsive.getDimensions());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Responsive dimensions listener
  useEffect(() => {
    const unsubscribe = responsive.subscribe((dimensions) => {
      setScreenData(dimensions);
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (showPulse) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Gentle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, [showPulse]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Get responsive size
  const responsiveSize = responsive.moderateScale(size, 0.3);
  const logoSize = responsiveSize * 0.65;
  
  // Get responsive shadow
  const shadowRadius = responsive.getResponsiveValue({
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  });
  
  const elevation = responsive.getResponsiveValue({
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  });

  return (
    <TouchableOpacity 
      style={[styles.container, {
        shadowRadius,
        elevation,
      }, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          {
            transform: [
              { scale: pulseAnim },
              { rotate: spin },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.accent, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.logoContainer,
            {
              width: responsiveSize,
              height: responsiveSize,
              borderRadius: responsiveSize / 2,
              borderWidth: responsive.getResponsiveValue({
                small: 1.5,
                medium: 2,
                large: 2.5,
                xlarge: 3,
              }),
            },
          ]}
        >
          <Image
            source={require('../../assets/cmswap-logo.jpeg')}
            style={[
              styles.logo,
              {
                width: logoSize,
                height: logoSize,
                borderRadius: logoSize / 2,
                borderWidth: responsive.getResponsiveValue({
                  small: 1,
                  medium: 1.5,
                  large: 2,
                  xlarge: 2.5,
                }),
              },
            ]}
            resizeMode="cover"
          />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    // shadowRadius and elevation handled inline
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth handled inline
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logo: {
    // borderWidth handled inline
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
}); 