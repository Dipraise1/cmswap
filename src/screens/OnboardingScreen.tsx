import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { FloatingLogo } from '../components/FloatingLogo';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  gradient: string[];
}

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const slides: OnboardingSlide[] = [
    {
      id: 0,
      icon: 'wallet',
      title: 'CMSWAP Wallet',
      subtitle: 'Your Digital Universe',
      description: 'Experience the future of crypto with our secure, intuitive wallet featuring advanced dark blue aesthetics and your personalized interface.',
      gradient: [Colors.primary, Colors.accent],
    },
    {
      id: 1,
      icon: 'chatbubbles',
      title: 'Wallet-to-Wallet Chat',
      subtitle: 'Revolutionary Messaging',
      description: 'Chat directly with other wallet holders and send payments seamlessly within conversations - a world-first feature.',
      gradient: [Colors.accent, Colors.primaryLight],
    },
    {
      id: 2,
      icon: 'swap-horizontal',
      title: 'Instant Swapping',
      subtitle: 'Lightning Fast Trades',
      description: 'Swap between different cryptocurrencies instantly with the best rates, powered by your personalized interface.',
      gradient: [Colors.primaryLight, Colors.primary],
    },
    {
      id: 3,
      icon: 'diamond',
      title: 'Premium Experience',
      subtitle: 'Your Crypto Journey',
      description: 'Step into the future with CMSWAP - where your custom branding meets cutting-edge crypto technology.',
      gradient: [Colors.primary, Colors.primaryDark],
    },
  ];

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
      animateSlide();
    } else {
      onComplete();
    }
  };

  const goToPrevious = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      scrollViewRef.current?.scrollTo({
        x: prevSlide * width,
        animated: true,
      });
      animateSlide();
    }
  };

  const animateSlide = () => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={styles.slide}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.slideBackground}
      >
        {/* Animated Content */}
        <Animated.View
          style={[
            styles.slideContent,
            {
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            {index === 0 ? (
              <FloatingLogo size={128} showPulse={true} />
            ) : (
              <LinearGradient
                colors={slide.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Ionicons name={slide.icon as any} size={64} color={Colors.text} />
              </LinearGradient>
            )}
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresPreview}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.featureItem}>
                <LinearGradient
                  colors={[Colors.surface, Colors.surfaceSecondary]}
                  style={styles.featureCard}
                >
                  <View style={styles.featurePlaceholder} />
                </LinearGradient>
              </View>
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentSlide ? Colors.primary : Colors.border,
              width: index === currentSlide ? 24 : 8,
            },
          ]}
          onPress={() => {
            setCurrentSlide(index);
            scrollViewRef.current?.scrollTo({
              x: index * width,
              animated: true,
            });
            animateSlide();
          }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlide(slideIndex);
          animateSlide();
        }}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Bottom Controls */}
      <BlurView intensity={100} style={styles.bottomControls}>
        {renderPagination()}

        <View style={styles.navigationButtons}>
          {currentSlide > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={goToPrevious}>
              <Ionicons name="chevron-back" size={24} color={Colors.textSecondary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.spacer} />
          
          <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextText}>
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.text} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  slideBackground: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 120,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 48,
  },
  slideSubtitle: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  slideDescription: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  featuresPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  featureItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  featureCard: {
    height: 80,
    borderRadius: 12,
    padding: 12,
  },
  featurePlaceholder: {
    flex: 1,
    backgroundColor: Colors.border,
    borderRadius: 8,
    opacity: 0.3,
  },
  bottomControls: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: Colors.border,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    borderRadius: 16,
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
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  nextText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
});

export default OnboardingScreen; 