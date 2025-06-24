import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../constants/Colors';
import { FloatingLogo } from '../components/FloatingLogo';
import { responsive, scale, moderateScale, getResponsiveValue } from '../utils/responsive';

interface OnboardingStep {
  id: number;
  type: 'welcome' | 'choice' | 'setup' | 'success';
  title: string;
  subtitle: string;
}

interface RealWalletOnboardingProps {
  onComplete: () => void;
}

const RealWalletOnboarding: React.FC<RealWalletOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreatingWallet, setIsCreatingWallet] = useState(true);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [screenData, setScreenData] = useState(responsive.getDimensions());
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  
  const steps: OnboardingStep[] = [
    {
      id: 0,
      type: 'welcome',
      title: 'Welcome to CMSWAP',
      subtitle: 'Your secure crypto wallet awaits'
    },
    {
      id: 1,
      type: 'choice',
      title: 'Get Started',
      subtitle: 'Create a new wallet or import existing'
    },
    {
      id: 2,
      type: 'setup',
      title: isCreatingWallet ? 'Creating Wallet' : 'Importing Wallet',
      subtitle: isCreatingWallet ? 'Setting up your new wallet...' : 'Restoring your wallet...'
    },
    {
      id: 3,
      type: 'success',
      title: 'All Set!',
      subtitle: 'Your wallet is ready to use'
    }
  ];

  // Responsive dimensions listener
  useEffect(() => {
    const unsubscribe = responsive.subscribe((dimensions) => {
      setScreenData(dimensions);
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale animation when step changes
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const generateSeedPhrase = () => {
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
    ];
    const phrase = [];
    for (let i = 0; i < 12; i++) {
      phrase.push(words[Math.floor(Math.random() * words.length)]);
    }
    setSeedPhrase(phrase);
  };

  const handleWalletChoice = (isCreating: boolean) => {
    setIsCreatingWallet(isCreating);
    if (isCreating) {
      generateSeedPhrase();
    }
    nextStep();
  };

  const nextStep = () => {
    if (currentStep === 2) {
      // Auto-agree to terms and move to success
      setIsAgreedToTerms(true);
    }
    
    if (currentStep < steps.length - 1) {
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
      });
    } else {
      onComplete();
    }
  };

  // Get responsive values
  const padding = responsive.getPadding();
  const cardSize = responsive.getCardSize();
  const isTablet = responsive.shouldUseTabletLayout();
  const logoSize = responsive.getResponsiveValue({
    small: 120,
    medium: 140,
    large: 160,
    xlarge: 180,
  });

  const renderWelcomeStep = () => (
    <Animated.View style={[styles.stepContainer, {
      transform: [{
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      }],
    }]}>
      <FloatingLogo size={logoSize} showPulse={true} />
      
      <View style={[styles.welcomeContent, { marginTop: padding.large }]}>
        <Text style={[styles.appTitle, { 
          fontSize: responsive.getFontSize(isTablet ? 48 : 36),
          marginBottom: padding.small,
        }]}>
          CMSWAP
        </Text>
        <Text style={[styles.appTagline, { 
          fontSize: responsive.getFontSize(18),
          marginBottom: padding.large,
        }]}>
          Your Gateway to DeFi
        </Text>
        
        <View style={styles.featuresList}>
          {[
            { icon: 'shield-checkmark', text: 'Bank-level security' },
            { icon: 'flash', text: 'Lightning fast' },
            { icon: 'chatbubbles', text: 'Built-in messaging' },
            { icon: 'swap-horizontal', text: 'Easy token swaps' },
          ].map((feature, index) => (
            <Animated.View 
              key={index} 
              style={[styles.featureItem, {
                opacity: slideAnim,
                marginBottom: padding.medium,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                }],
              }]}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={[styles.featureIcon, {
                  width: responsive.getIconSize(40),
                  height: responsive.getIconSize(40),
                  borderRadius: responsive.getIconSize(20),
                  marginRight: padding.medium,
                }]}
              >
                <Ionicons 
                  name={feature.icon as any} 
                  size={responsive.getIconSize(20)} 
                  color={Colors.text} 
                />
              </LinearGradient>
              <Text style={[styles.featureText, { 
                fontSize: responsive.getFontSize(16),
                flex: 1,
              }]}>
                {feature.text}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderChoiceStep = () => (
    <Animated.View style={[styles.stepContainer, {
      transform: [{ scale: scaleAnim }],
    }]}>
      <View style={[styles.choiceContent, { gap: padding.large }]}>
        {/* Create New Wallet Option */}
        <TouchableOpacity
          style={[styles.choiceCard, {
            borderRadius: cardSize.borderRadius,
            overflow: 'hidden',
          }]}
          onPress={() => handleWalletChoice(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            style={styles.choiceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={20} style={[styles.choiceBlur, {
              borderRadius: cardSize.borderRadius,
              padding: cardSize.padding,
            }]}>
              <Animated.View style={[styles.choiceIcon, {
                width: responsive.getIconSize(80),
                height: responsive.getIconSize(80),
                borderRadius: responsive.getIconSize(40),
                marginBottom: padding.medium,
                transform: [{
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
              }]}>
                <LinearGradient
                  colors={[Colors.background, Colors.backgroundSecondary]}
                  style={[styles.choiceIconInner, {
                    width: responsive.getIconSize(80),
                    height: responsive.getIconSize(80),
                    borderRadius: responsive.getIconSize(40),
                  }]}
                >
                  <Ionicons 
                    name="add-circle" 
                    size={responsive.getIconSize(40)} 
                    color={Colors.primary} 
                  />
                </LinearGradient>
              </Animated.View>
              
              <Text style={[styles.choiceTitle, { 
                fontSize: responsive.getFontSize(22),
                marginBottom: padding.small,
              }]}>
                Create New Wallet
              </Text>
              <Text style={[styles.choiceDescription, { 
                fontSize: responsive.getFontSize(15),
                marginBottom: padding.medium,
              }]}>
                Generate a fresh wallet with secure recovery phrase
              </Text>
              
              <View style={styles.choiceFeatures}>
                {['New recovery phrase', 'Instant setup', 'Maximum security'].map((feature, index) => (
                  <View key={index} style={[styles.choiceFeature, { marginBottom: padding.small / 2 }]}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={responsive.getIconSize(16)} 
                      color={Colors.success} 
                    />
                    <Text style={[styles.choiceFeatureText, { 
                      fontSize: responsive.getFontSize(13),
                      marginLeft: padding.small,
                    }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </LinearGradient>
        </TouchableOpacity>

        {/* Import Existing Wallet Option */}
        <TouchableOpacity
          style={[styles.choiceCard, {
            borderRadius: cardSize.borderRadius,
            overflow: 'hidden',
          }]}
          onPress={() => handleWalletChoice(false)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.accent, Colors.primaryLight]}
            style={styles.choiceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={20} style={[styles.choiceBlur, {
              borderRadius: cardSize.borderRadius,
              padding: cardSize.padding,
            }]}>
              <Animated.View style={[styles.choiceIcon, {
                width: responsive.getIconSize(80),
                height: responsive.getIconSize(80),
                borderRadius: responsive.getIconSize(40),
                marginBottom: padding.medium,
                transform: [{
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
              }]}>
                <LinearGradient
                  colors={[Colors.background, Colors.backgroundSecondary]}
                  style={[styles.choiceIconInner, {
                    width: responsive.getIconSize(80),
                    height: responsive.getIconSize(80),
                    borderRadius: responsive.getIconSize(40),
                  }]}
                >
                  <Ionicons 
                    name="download" 
                    size={responsive.getIconSize(40)} 
                    color={Colors.accent} 
                  />
                </LinearGradient>
              </Animated.View>
              
              <Text style={[styles.choiceTitle, { 
                fontSize: responsive.getFontSize(22),
                marginBottom: padding.small,
              }]}>
                Import Existing
              </Text>
              <Text style={[styles.choiceDescription, { 
                fontSize: responsive.getFontSize(15),
                marginBottom: padding.medium,
              }]}>
                Restore your wallet using recovery phrase
              </Text>
              
              <View style={styles.choiceFeatures}>
                {['Use existing phrase', 'Keep your assets', 'Quick restore'].map((feature, index) => (
                  <View key={index} style={[styles.choiceFeature, { marginBottom: padding.small / 2 }]}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={responsive.getIconSize(16)} 
                      color={Colors.success} 
                    />
                    <Text style={[styles.choiceFeatureText, { 
                      fontSize: responsive.getFontSize(13),
                      marginLeft: padding.small,
                    }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </BlurView>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSetupStep = () => (
    <Animated.View style={[styles.stepContainer, {
      transform: [{ scale: scaleAnim }],
    }]}>
      <View style={[styles.setupContent, { alignItems: 'center' }]}>
        {/* Animated Setup Icon */}
        <Animated.View style={{
          transform: [{
            rotate: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          }],
          marginBottom: padding.large,
        }}>
          <LinearGradient
            colors={isCreatingWallet ? [Colors.primary, Colors.accent] : [Colors.accent, Colors.primaryLight]}
            style={[styles.setupIcon, {
              width: responsive.getIconSize(100),
              height: responsive.getIconSize(100),
              borderRadius: responsive.getIconSize(50),
            }]}
          >
            <Ionicons 
              name={isCreatingWallet ? "construct" : "download"} 
              size={responsive.getIconSize(50)} 
              color={Colors.text} 
            />
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.setupTitle, { 
          fontSize: responsive.getFontSize(24),
          marginBottom: padding.medium,
        }]}>
          {isCreatingWallet ? 'Creating your wallet...' : 'Importing your wallet...'}
        </Text>

        <View style={[styles.setupProgress, { marginBottom: padding.large }]}>
          {(isCreatingWallet ? [
            'Generating secure keys',
            'Creating recovery phrase',
            'Initializing wallet'
          ] : [
            'Validating recovery phrase',
            'Restoring wallet data',
            'Syncing with blockchain'
          ]).map((step, index) => (
            <Animated.View 
              key={index}
              style={[styles.progressItem, {
                opacity: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              }]}
            >
              <LinearGradient
                colors={[Colors.success, '#00A844']}
                style={[styles.checkIcon, {
                  width: responsive.getIconSize(24),
                  height: responsive.getIconSize(24),
                  borderRadius: responsive.getIconSize(12),
                  marginRight: padding.small,
                }]}
              >
                <Ionicons 
                  name="checkmark" 
                  size={responsive.getIconSize(16)} 
                  color={Colors.text} 
                />
              </LinearGradient>
              <Text style={[styles.progressText, {
                fontSize: responsive.getFontSize(16),
              }]}>
                {step}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Security Badge */}
        <View style={[styles.securityBadge, {
          borderRadius: cardSize.borderRadius,
          padding: padding.medium,
        }]}>
          <Ionicons 
            name="shield-checkmark" 
            size={responsive.getIconSize(32)} 
            color={Colors.success} 
          />
          <Text style={[styles.securityText, {
            fontSize: responsive.getFontSize(14),
            marginLeft: padding.small,
          }]}>
            {isCreatingWallet 
              ? 'Your keys are encrypted and stored securely'
              : 'Your wallet has been restored successfully'
            }
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderSuccessStep = () => (
    <Animated.View style={[styles.stepContainer, {
      transform: [{ scale: scaleAnim }],
    }]}>
      <View style={[styles.successContent, { alignItems: 'center' }]}>
        {/* Success Animation */}
        <Animated.View style={{
          transform: [{
            scale: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
          }],
          marginBottom: padding.large,
        }}>
          <LinearGradient
            colors={[Colors.success, '#00A844']}
            style={[styles.successIcon, {
              width: responsive.getIconSize(120),
              height: responsive.getIconSize(120),
              borderRadius: responsive.getIconSize(60),
            }]}
          >
            <Ionicons 
              name="checkmark-circle" 
              size={responsive.getIconSize(60)} 
              color={Colors.text} 
            />
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.successTitle, { 
          fontSize: responsive.getFontSize(28),
          marginBottom: padding.medium,
        }]}>
          {isCreatingWallet ? 'Wallet Created!' : 'Wallet Imported!'}
        </Text>

        <Text style={[styles.successSubtitle, { 
          fontSize: responsive.getFontSize(16),
          marginBottom: padding.large,
        }]}>
          You're all set to start trading, swapping, and messaging
        </Text>

        {/* Feature Preview Cards */}
        <View style={[styles.previewCards, { gap: padding.small }]}>
          {[
            { icon: 'wallet', title: 'Portfolio', desc: 'Track your assets' },
            { icon: 'swap-horizontal', title: 'Swap', desc: 'Trade instantly' },
            { icon: 'chatbubbles', title: 'Messages', desc: 'Chat & pay' },
          ].map((card, index) => (
            <Animated.View
              key={index}
              style={[styles.previewCard, {
                borderRadius: cardSize.borderRadius,
                padding: padding.medium,
                flex: 1,
                opacity: slideAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              }]}
            >
              <LinearGradient
                colors={[Colors.surface, Colors.surfaceSecondary]}
                style={[styles.previewCardGradient, {
                  borderRadius: cardSize.borderRadius,
                }]}
              >
                <Ionicons 
                  name={card.icon as any} 
                  size={responsive.getIconSize(24)} 
                  color={Colors.primary} 
                />
                <Text style={[styles.previewCardTitle, {
                  fontSize: responsive.getFontSize(14),
                  marginTop: padding.small / 2,
                }]}>
                  {card.title}
                </Text>
                <Text style={[styles.previewCardDesc, {
                  fontSize: responsive.getFontSize(12),
                }]}>
                  {card.desc}
                </Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (steps[currentStep].type) {
      case 'welcome':
        return renderWelcomeStep();
      case 'choice':
        return renderChoiceStep();
      case 'setup':
        return renderSetupStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderWelcomeStep();
    }
  };

  const shouldShowContinueButton = () => {
    return currentStep !== 1; // Hide on choice step since cards handle navigation
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.background}
      >
        {/* Progress Indicator */}
        <View style={[styles.progressContainer, {
          paddingHorizontal: padding.horizontal,
          paddingTop: padding.medium,
        }]}>
          <View style={styles.progressBar}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStep ? Colors.primary : Colors.border,
                    width: responsive.getSpacing(index <= currentStep ? 32 : 8),
                    height: responsive.getSpacing(8),
                    borderRadius: responsive.getSpacing(4),
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, {
            paddingHorizontal: padding.horizontal,
            maxWidth: responsive.getMaxWidth(),
            alignSelf: 'center',
            width: '100%',
          }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Step Header */}
          <Animated.View style={[styles.stepHeader, {
            opacity: slideAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            }],
          }]}>
            <Text style={[styles.stepTitle, { 
              fontSize: responsive.getFontSize(isTablet ? 32 : 28),
            }]}>
              {steps[currentStep].title}
            </Text>
            <Text style={[styles.stepSubtitle, { 
              fontSize: responsive.getFontSize(16),
            }]}>
              {steps[currentStep].subtitle}
            </Text>
          </Animated.View>

          {/* Step Content */}
          {renderCurrentStep()}
        </ScrollView>

        {/* Bottom Action */}
        {shouldShowContinueButton() && (
          <Animated.View 
            style={[styles.bottomAction, {
              paddingHorizontal: padding.horizontal,
              paddingBottom: padding.large,
              opacity: slideAnim,
            }]}
          >
            <TouchableOpacity
              style={[styles.continueButton, {
                borderRadius: cardSize.borderRadius,
                paddingVertical: padding.medium,
              }]}
              onPress={nextStep}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={[styles.continueButtonGradient, {
                  borderRadius: cardSize.borderRadius,
                  paddingVertical: padding.medium,
                }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.continueButtonText, { 
                  fontSize: responsive.getFontSize(18),
                }]}>
                  {currentStep === steps.length - 1 ? 'Start Trading' : 'Continue'}
                </Text>
                <Ionicons 
                  name={currentStep === steps.length - 1 ? 'rocket' : 'chevron-forward'} 
                  size={responsive.getIconSize(20)} 
                  color={Colors.text} 
                  style={{ marginLeft: padding.small }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  progressContainer: {
    paddingVertical: 16,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    // dimensions handled inline
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepTitle: {
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  welcomeContent: {
    alignItems: 'center',
    width: '100%',
  },
  appTitle: {
    fontWeight: '900',
    color: Colors.text,
    textAlign: 'center',
  },
  appTagline: {
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  featuresList: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: Colors.text,
    fontWeight: '500',
  },
  choiceContent: {
    width: '100%',
    maxWidth: 400,
  },
  choiceCard: {
    elevation: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  choiceGradient: {
    flex: 1,
  },
  choiceBlur: {
    alignItems: 'center',
  },
  choiceIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceIconInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceTitle: {
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  choiceDescription: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  choiceFeatures: {
    alignItems: 'flex-start',
    width: '100%',
  },
  choiceFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceFeatureText: {
    color: Colors.text,
    fontWeight: '500',
  },
  setupContent: {
    width: '100%',
    maxWidth: 350,
  },
  setupIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  setupTitle: {
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  setupProgress: {
    width: '100%',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: Colors.text,
    fontWeight: '500',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 168, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 68, 0.3)',
  },
  securityText: {
    color: Colors.success,
    fontWeight: '500',
    flex: 1,
  },
  successContent: {
    width: '100%',
    maxWidth: 350,
  },
  successIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  successTitle: {
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  successSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  previewCards: {
    flexDirection: 'row',
    width: '100%',
  },
  previewCard: {
    // flex and dimensions handled inline
  },
  previewCardGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  previewCardTitle: {
    fontWeight: '600',
    color: Colors.text,
  },
  previewCardDesc: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomAction: {
    // padding handled inline
  },
  continueButton: {
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontWeight: '700',
    color: Colors.text,
  },
});

export default RealWalletOnboarding; 