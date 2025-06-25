import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';

interface GlassMorphismCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  colors?: string[];
  borderRadius?: number;
  showBorder?: boolean;
  showShadow?: boolean;
  animationType?: 'none' | 'scale' | 'float' | 'glow';
  glowColor?: string;
}

export const GlassMorphismCard: React.FC<GlassMorphismCardProps> = ({
  children,
  style,
  intensity = 20,
  colors = [Colors.primary + '20', Colors.accent + '15', Colors.primaryLight + '10'],
  borderRadius = 20,
  showBorder = true,
  showShadow = true,
  animationType = 'none',
  glowColor = Colors.primary,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animationType === 'scale') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (animationType === 'float') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -5,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 5,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (animationType === 'glow') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animationType]);

  const getTransform = () => {
    const transforms: any[] = [];
    
    if (animationType === 'scale') {
      transforms.push({ scale: scaleAnim });
    }
    
    if (animationType === 'float') {
      transforms.push({ translateY: floatAnim });
    }
    
    return transforms;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderRadius,
          transform: getTransform(),
        },
        showShadow && {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: animationType === 'glow' ? 0.4 : 0.2,
          shadowRadius: 16,
          elevation: 12,
        },
        style,
      ]}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={colors}
        style={[styles.gradient, { borderRadius }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Glass Blur Effect */}
      <BlurView
        intensity={intensity}
        style={[
          styles.blur,
          {
            borderRadius,
            borderWidth: showBorder ? 1 : 0,
            borderColor: Colors.glassBorder,
          },
        ]}
      >
        {/* Glow Effect */}
        {animationType === 'glow' && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                borderRadius,
                opacity: glowAnim,
                shadowColor: glowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 20,
              },
            ]}
          />
        )}
        
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 20,
  },
}); 