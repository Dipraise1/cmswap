import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const SwapScreen: React.FC = () => {
  const [fromToken, setFromToken] = useState('SOL');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Swap Tokens</Text>
        
        <View style={styles.swapContainer}>
          <View style={styles.tokenInput}>
            <Text style={styles.inputLabel}>From</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                value={fromAmount}
                onChangeText={setFromAmount}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.tokenSelector}>
                <Text style={styles.tokenText}>{fromToken}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.swapButton}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.swapButtonGradient}
            >
              <Ionicons name="swap-vertical" size={24} color={Colors.text} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.tokenInput}>
            <Text style={styles.inputLabel}>To</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                value={toAmount}
                onChangeText={setToAmount}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity style={styles.tokenSelector}>
                <Text style={styles.tokenText}>{toToken}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmButton}>
          <LinearGradient
            colors={[Colors.accent, Colors.accentDark]}
            style={styles.confirmButtonGradient}
          >
            <Text style={styles.confirmButtonText}>Swap Tokens</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 20,
  },
  swapContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  tokenInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: Colors.text,
    paddingVertical: 12,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tokenText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  swapButton: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  swapButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default SwapScreen; 