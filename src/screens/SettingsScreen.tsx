import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  danger?: boolean;
}

const SettingsScreen: React.FC = () => {
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoLockEnabled, setAutoLockEnabled] = useState(false);

  const securitySettings: SettingItem[] = [
    {
      id: 'biometric',
      title: 'Biometric Authentication',
      subtitle: 'Use Face ID or Touch ID to unlock',
      icon: 'finger-print',
      type: 'toggle',
      value: biometricEnabled,
      onPress: () => setBiometricEnabled(!biometricEnabled),
    },
    {
      id: 'autolock',
      title: 'Auto Lock',
      subtitle: 'Lock app when inactive',
      icon: 'lock-closed',
      type: 'toggle',
      value: autoLockEnabled,
      onPress: () => setAutoLockEnabled(!autoLockEnabled),
    },
    {
      id: 'recovery',
      title: 'Recovery Phrase',
      subtitle: 'View and backup your recovery phrase',
      icon: 'key',
      type: 'navigation',
      onPress: () => Alert.alert('Recovery Phrase', 'This would show recovery phrase backup options'),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Get notified about transactions',
      icon: 'notifications',
      type: 'toggle',
      value: notificationsEnabled,
      onPress: () => setNotificationsEnabled(!notificationsEnabled),
    },
    {
      id: 'currency',
      title: 'Currency',
      subtitle: 'USD',
      icon: 'card',
      type: 'navigation',
      onPress: () => Alert.alert('Currency', 'This would show currency selection'),
    },
    {
      id: 'network',
      title: 'Network',
      subtitle: 'Solana Mainnet',
      icon: 'globe',
      type: 'navigation',
      onPress: () => Alert.alert('Network', 'This would show network selection'),
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle',
      type: 'navigation',
      onPress: () => Alert.alert('Help', 'This would open help center'),
    },
    {
      id: 'about',
      title: 'About CMSWAP',
      subtitle: 'Version 1.0.0',
      icon: 'information-circle',
      type: 'navigation',
      onPress: () => Alert.alert('About', 'CMSWAP v1.0.0\nAdvanced crypto wallet with messaging'),
    },
    {
      id: 'logout',
      title: 'Sign Out',
      icon: 'log-out',
      type: 'action',
      danger: true,
      onPress: () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive' },
      ]),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity key={item.id} style={styles.settingItem} onPress={item.onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, item.danger && styles.dangerIcon]}>
          <Ionicons 
            name={item.icon as any} 
            size={20} 
            color={item.danger ? Colors.error : Colors.primary} 
          />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, item.danger && styles.dangerText]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.text}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.profileCard}
          >
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={32} color={Colors.text} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>My Wallet</Text>
              <Text style={styles.profileAddress}>9WzD...AWWM</Text>
            </View>
            <TouchableOpacity style={styles.profileEditButton}>
              <Ionicons name="create-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.settingsGroup}>
            {securitySettings.map(renderSettingItem)}
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsGroup}>
            {appSettings.map(renderSettingItem)}
          </View>
        </View>

        {/* Support Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            {supportSettings.map(renderSettingItem)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  profileAddress: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
    fontFamily: 'monospace',
  },
  profileEditButton: {
    padding: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  dangerText: {
    color: Colors.error,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingRight: {
    alignItems: 'center',
  },
});

export default SettingsScreen; 