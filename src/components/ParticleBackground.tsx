import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
  duration: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  intensity?: 'low' | 'medium' | 'high';
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 15,
  colors = [Colors.primary, Colors.accent, Colors.primaryLight, Colors.success],
  intensity = 'medium'
}) => {
  const particles = useRef<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  const intensityConfig = {
    low: { speed: 0.3, size: 0.8, opacity: 0.4 },
    medium: { speed: 0.5, size: 1, opacity: 0.6 },
    high: { speed: 0.8, size: 1.2, opacity: 0.8 }
  };

  const config = intensityConfig[intensity];

  useEffect(() => {
    // Initialize particles
    particles.current = Array.from({ length: particleCount }, (_, index) => ({
      id: index,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: (Math.random() * 8 + 4) * config.size,
      duration: (Math.random() * 4000 + 3000) / config.speed,
    }));

    startAnimations();

    return () => {
      animationsRef.current.forEach(animation => animation.stop());
    };
  }, []);

  const startAnimations = () => {
    particles.current.forEach((particle, index) => {
      const animateParticle = () => {
        // Reset position
        particle.x.setValue(Math.random() * width);
        particle.y.setValue(height + 50);
        particle.opacity.setValue(0);
        particle.scale.setValue(0);

        const animation = Animated.sequence([
          // Fade in and scale up
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: Math.random() * config.opacity + 0.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          // Float upward with random horizontal movement
          Animated.parallel([
            Animated.timing(particle.y, {
              toValue: -50,
              duration: particle.duration,
              useNativeDriver: true,
            }),
            Animated.timing(particle.x, {
              toValue: Math.random() * width,
              duration: particle.duration,
              useNativeDriver: true,
            }),
            // Gentle pulsing
            Animated.loop(
              Animated.sequence([
                Animated.timing(particle.scale, {
                  toValue: 1.2,
                  duration: 2000,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.scale, {
                  toValue: 0.8,
                  duration: 2000,
                  useNativeDriver: true,
                }),
              ])
            ),
          ]),
          // Fade out
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]);

        animation.start(() => {
          // Restart animation with delay
          setTimeout(() => animateParticle(), Math.random() * 2000);
        });

        animationsRef.current[index] = animation;
      };

      // Start each particle with a random delay
      setTimeout(() => animateParticle(), Math.random() * 5000);
    });
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: 0,
              top: 0,
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  particle: {
    position: 'absolute',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
}); 