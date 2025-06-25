import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { FloatingLogo } from '../components/FloatingLogo';
import { responsive } from '../utils/responsive';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  gradient?: string[];
  danger?: boolean;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const EnhancedSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState({
    biometricAuth: true,
    pushNotifications: true,
    priceAlerts: true,
    autoLock: true,
    darkMode: true,
    testnet: false,
    analytics: false,
    clipboard: true,
  });

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState<'import' | 'create' | 'manage'>('create');
  
  const [wallets, setWallets] = useState([
    {
      id: '1',
      name: 'Main Wallet',
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      type: 'SOL',
      isActive: true,
      balance: 124.52,
    },
    {
      id: '2',
      name: 'Trading Wallet',
      address: '0x742d35Cc6665C0532846a62EFFA662D2478B54F3',
      type: 'ETH',
      isActive: false,
      balance: 3.24,
    },
  ]);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

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
  }, []);

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAddWallet = () => {
    if (!walletName.trim()) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }

    if (walletType === 'import' && !walletAddress.trim()) {
      Alert.alert('Error', 'Please enter a valid wallet address');
      return;
    }

    const newWallet = {
      id: Date.now().toString(),
      name: walletName.trim(),
      address: walletType === 'create' ? 
        `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` :
        walletAddress.trim(),
      type: 'SOL',
      isActive: false,
      balance: 0,
    };

    setWallets(prev => [...prev, newWallet]);
    setWalletName('');
    setWalletAddress('');
    setShowWalletModal(false);
    Alert.alert('Success', `${walletType === 'create' ? 'New wallet created' : 'Wallet imported'} successfully!`);
  };

  const handleSwitchWallet = (walletId: string) => {
    setWallets(prev => 
      prev.map(wallet => ({
        ...wallet,
        isActive: wallet.id === walletId
      }))
    );
    Alert.alert('Wallet Switched', 'Active wallet updated successfully!');
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: onConfirm, style: 'destructive' },
      ]
    );
  };

  const sections: SettingsSection[] = [
    {
      title: 'Wallet Management',
      items: [
        {
          id: 'manage_wallets',
          title: 'Manage Wallets',
          subtitle: `${wallets.length} wallets • ${wallets.find(w => w.isActive)?.name}`,
          icon: 'wallet',
          type: 'action',
          onPress: () => {
            setWalletType('manage');
            setShowWalletModal(true);
          },
          gradient: [Colors.brightBlue, Colors.accent],
        },
        {
          id: 'import_wallet',
          title: 'Import Wallet',
          subtitle: 'Add existing wallet with seed phrase',
          icon: 'download',
          type: 'action',
          onPress: () => {
            setWalletType('import');
            setShowWalletModal(true);
          },
          gradient: [Colors.success, '#00A844'],
        },
        {
          id: 'create_wallet',
          title: 'Create New Wallet',
          subtitle: 'Generate a new wallet address',
          icon: 'add-circle',
          type: 'action',
          onPress: () => {
            setWalletType('create');
            setShowWalletModal(true);
          },
          gradient: [Colors.primary, Colors.primaryDark],
        },
      ],
    },
    {
      title: 'Security & Privacy',
      items: [
        {
          id: 'biometric',
          title: 'Biometric Authentication',
          subtitle: 'Use Face ID or Touch ID to unlock',
          icon: 'finger-print',
          type: 'toggle',
          value: settings.biometricAuth,
          onToggle: (value) => handleToggle('biometricAuth', value),
          gradient: [Colors.primary, Colors.accent],
        },
        {
          id: 'autolock',
          title: 'Auto-Lock',
          subtitle: 'Lock wallet after 5 minutes of inactivity',
          icon: 'lock-closed',
          type: 'toggle',
          value: settings.autoLock,
          onToggle: (value) => handleToggle('autoLock', value),
          gradient: [Colors.warning, '#FF9500'],
        },
        {
          id: 'backup',
          title: 'Backup Seed Phrase',
          subtitle: 'Secure your wallet recovery phrase',
          icon: 'shield-checkmark',
          type: 'action',
          onPress: () => setShowBackupModal(true),
          gradient: [Colors.success, '#00A844'],
        },
        {
          id: 'password',
          title: 'Change Password',
          subtitle: 'Update your wallet password',
          icon: 'key',
          type: 'action',
          onPress: () => setShowSecurityModal(true),
          gradient: [Colors.primary, Colors.primaryDark],
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          title: 'Push Notifications',
          subtitle: 'Transaction updates and news',
          icon: 'notifications',
          type: 'toggle',
          value: settings.pushNotifications,
          onToggle: (value) => handleToggle('pushNotifications', value),
          gradient: [Colors.accent, Colors.primaryLight],
        },
        {
          id: 'alerts',
          title: 'Price Alerts',
          subtitle: 'Get notified of price changes',
          icon: 'trending-up',
          type: 'toggle',
          value: settings.priceAlerts,
          onToggle: (value) => handleToggle('priceAlerts', value),
          gradient: [Colors.primary, Colors.accent],
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'darkmode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme interface',
          icon: 'moon',
          type: 'toggle',
          value: settings.darkMode,
          onToggle: (value) => handleToggle('darkMode', value),
          gradient: [Colors.surface, Colors.surfaceSecondary],
        },
        {
          id: 'clipboard',
          title: 'Clipboard Access',
          subtitle: 'Allow copying addresses and hashes',
          icon: 'copy',
          type: 'toggle',
          value: settings.clipboard,
          onToggle: (value) => handleToggle('clipboard', value),
          gradient: [Colors.primary, Colors.accent],
        },
        {
          id: 'currency',
          title: 'Default Currency',
          subtitle: 'USD',
          icon: 'card',
          type: 'navigation',
          gradient: [Colors.accent, Colors.primaryLight],
        },
        {
          id: 'network',
          title: 'Network Settings',
          subtitle: 'Mainnet',
          icon: 'globe',
          type: 'navigation',
          gradient: [Colors.primary, Colors.primaryDark],
        },
      ],
    },
    {
      title: 'Advanced',
      items: [
        {
          id: 'testnet',
          title: 'Enable Testnet',
          subtitle: 'Switch to test networks',
          icon: 'flask',
          type: 'toggle',
          value: settings.testnet,
          onToggle: (value) => handleToggle('testnet', value),
          gradient: [Colors.warning, '#FF9500'],
        },
        {
          id: 'analytics',
          title: 'Analytics',
          subtitle: 'Help improve the app',
          icon: 'analytics',
          type: 'toggle',
          value: settings.analytics,
          onToggle: (value) => handleToggle('analytics', value),
          gradient: [Colors.accent, Colors.primary],
        },
        {
          id: 'developer',
          title: 'Developer Options',
          subtitle: 'Advanced debugging tools',
          icon: 'code-slash',
          type: 'navigation',
          gradient: [Colors.surface, Colors.surfaceSecondary],
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'FAQs and documentation',
          icon: 'help-circle',
          type: 'navigation',
          gradient: [Colors.primary, Colors.accent],
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get help from our team',
          icon: 'chatbubble-ellipses',
          type: 'navigation',
          gradient: [Colors.accent, Colors.primaryLight],
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: 'document-text',
          type: 'navigation',
          gradient: [Colors.surface, Colors.surfaceSecondary],
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          icon: 'shield-checkmark',
          type: 'navigation',
          gradient: [Colors.surface, Colors.surfaceSecondary],
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'reset',
          title: 'Reset Wallet',
          subtitle: 'Clear all data and start fresh',
          icon: 'refresh',
          type: 'action',
          danger: true,
          onPress: () => showConfirmDialog(
            'Reset Wallet',
            'This will delete all wallet data. Make sure you have your seed phrase backed up.',
            () => Alert.alert('Wallet Reset', 'Feature coming soon!')
          ),
          gradient: [Colors.error, '#FF6B6B'],
        },
        {
          id: 'delete',
          title: 'Delete Wallet',
          subtitle: 'Permanently remove this wallet',
          icon: 'trash',
          type: 'action',
          danger: true,
          onPress: () => showConfirmDialog(
            'Delete Wallet',
            'This action cannot be undone. Your wallet will be permanently deleted.',
            () => Alert.alert('Delete Wallet', 'Feature coming soon!')
          ),
          gradient: [Colors.error, '#FF4444'],
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem, index: number) => (
    <Animated.View
      key={item.id}
      style={[styles.settingsItem, {
        transform: [{
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [300, 0],
          })
        }, {
          scale: scaleAnim,
        }],
        opacity: slideAnim,
      }]}
    >
      <TouchableOpacity
        style={[styles.settingsItemContent, item.danger && styles.dangerItem]}
        onPress={item.onPress}
        activeOpacity={0.8}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingsItemLeft}>
          <LinearGradient
            colors={item.gradient || [Colors.surface, Colors.surfaceSecondary]}
            style={[styles.settingsIcon, item.danger && styles.dangerIcon]}
          >
            <Ionicons 
              name={item.icon as any} 
              size={24} 
              color={item.danger ? Colors.error : Colors.text} 
            />
          </LinearGradient>
          <View style={styles.settingsItemInfo}>
            <Text style={[styles.settingsItemTitle, item.danger && styles.dangerText]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <View style={styles.settingsItemRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value || false}
              onValueChange={item.onToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={item.value ? Colors.accent : Colors.textSecondary}
            />
          )}
          {item.type === 'navigation' && (
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <Animated.View 
        style={[styles.header, {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            })
          }],
          opacity: slideAnim,
        }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your CMSWAP experience</Text>
        </View>
        <Animated.View style={{
          transform: [{
            translateY: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -8],
            })
          }]
        }}>
          <FloatingLogo size={56} showPulse={true} />
        </Animated.View>
      </Animated.View>

      {/* Profile Card */}
      <Animated.View 
        style={[styles.profileCard, {
          transform: [{ scale: scaleAnim }],
          opacity: slideAnim,
        }]}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.accent, Colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <BlurView intensity={30} style={styles.profileContent}>
            <FloatingLogo size={80} showPulse={false} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>CMSWAP Wallet</Text>
              <Text style={styles.profileAddress}>0x7a8b...9c2f</Text>
              <Text style={styles.profileNetwork}>Connected to Mainnet</Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Ionicons name="pencil" size={20} color={Colors.text} />
            </TouchableOpacity>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sections.map((section, sectionIndex) => (
          <Animated.View 
            key={section.title}
            style={[styles.section, {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100 * (sectionIndex + 1), 0],
                })
              }],
              opacity: slideAnim,
            }]}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, index) => renderSettingsItem(item, index))}
          </Animated.View>
        ))}

        {/* App Version */}
        <Animated.View 
          style={[styles.versionInfo, {
            opacity: slideAnim,
          }]}
        >
          <Text style={styles.versionText}>CMSWAP v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ for crypto enthusiasts</Text>
        </Animated.View>
      </ScrollView>

      {/* Security Modal */}
      <Modal
        visible={showSecurityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSecurityModal(false)}
      >
        <BlurView intensity={100} style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={[Colors.surface, Colors.surfaceSecondary]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Change Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Current Password"
                placeholderTextColor={Colors.textSecondary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.modalInput}
                placeholder="New Password"
                placeholderTextColor={Colors.textSecondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowSecurityModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonPrimary}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.accent]}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Update</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* Wallet Management Modal */}
      <Modal
        visible={showWalletModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <BlurView intensity={100} style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={[Colors.surface, Colors.background]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>
                {walletType === 'create' ? 'Create New Wallet' : 
                 walletType === 'import' ? 'Import Wallet' : 'Manage Wallets'}
              </Text>

              {walletType !== 'manage' ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Wallet Name"
                    placeholderTextColor={Colors.textSecondary}
                    value={walletName}
                    onChangeText={setWalletName}
                  />

                  {walletType === 'import' && (
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Wallet Address or Seed Phrase"
                      placeholderTextColor={Colors.textSecondary}
                      value={walletAddress}
                      onChangeText={setWalletAddress}
                      multiline
                    />
                  )}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setShowWalletModal(false)}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleAddWallet}>
                      <LinearGradient
                        colors={[Colors.brightBlue, Colors.accent]}
                        style={styles.modalButtonGradient}
                      >
                        <Text style={styles.modalButtonTextPrimary}>
                          {walletType === 'create' ? 'Create' : 'Import'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {wallets.map((wallet) => (
                      <TouchableOpacity
                        key={wallet.id}
                        style={[
                          styles.walletItem,
                          wallet.isActive && styles.activeWalletItem
                        ]}
                        onPress={() => handleSwitchWallet(wallet.id)}
                      >
                        <View style={styles.walletInfo}>
                          <Text style={styles.walletName}>{wallet.name}</Text>
                          <Text style={styles.walletAddress}>
                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
                          </Text>
                          <Text style={styles.walletBalance}>
                            {wallet.balance} {wallet.type}
                          </Text>
                        </View>
                        {wallet.isActive && (
                          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setShowWalletModal(false)}
                    >
                      <Text style={styles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.modalButtonPrimary} 
                      onPress={() => {
                        setWalletType('create');
                        // Keep modal open to switch to create mode
                      }}
                    >
                      <LinearGradient
                        colors={[Colors.primary, Colors.accent]}
                        style={styles.modalButtonGradient}
                      >
                        <Text style={styles.modalButtonTextPrimary}>Add New</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  profileGradient: {
    padding: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 22,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  profileAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  profileNetwork: {
    fontSize: 12,
    color: Colors.success,
  },
  editProfileButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  settingsItem: {
    marginBottom: 12,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dangerItem: {
    borderColor: 'rgba(255, 68, 68, 0.2)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dangerIcon: {
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  settingsItemInfo: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  dangerText: {
    color: Colors.error,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingsItemRight: {
    marginLeft: 16,
  },
  versionInfo: {
    alignItems: 'center',
    padding: 32,
  },
  versionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
  },
  walletItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  activeWalletItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  walletBalance: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});

export default EnhancedSettingsScreen; 