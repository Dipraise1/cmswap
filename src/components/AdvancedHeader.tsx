import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface AdvancedHeaderProps {
  title: string;
  subtitle?: string;
  showProfile?: boolean;
  showNotification?: boolean;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  backgroundColor?: string;
  useBlur?: boolean;
}

const AdvancedHeader: React.FC<AdvancedHeaderProps> = ({
  title,
  subtitle,
  showProfile = true,
  showNotification = true,
  onProfilePress,
  onNotificationPress,
  backgroundColor = Colors.background,
  useBlur = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const HeaderContent = () => (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerLeft,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>

      <Animated.View
        style={[
          styles.headerRight,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {showNotification && (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationPress}
            activeOpacity={0.7}
          >
            <View style={styles.notificationDot} />
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        )}

        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={onProfilePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              style={styles.profileGradient}
            >
              <Image
                source={require('../../assets/cmswap-logo.jpeg')}
                style={styles.profileImage}
                resizeMode="cover"
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );

  if (useBlur) {
    return (
      <BlurView intensity={100} style={[styles.blurContainer, { backgroundColor }]}>
        <HeaderContent />
      </BlurView>
    );
  }

  return (
    <View style={[styles.regularContainer, { backgroundColor }]}>
      <HeaderContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  blurContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  regularContainer: {
    // No additional styles needed
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  notificationButton: {
    padding: 12,
    position: 'relative',
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    zIndex: 1,
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default AdvancedHeader; 