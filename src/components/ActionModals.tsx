import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../constants/Colors';
import { TokenImage } from './TokenImage';

interface PortfolioToken {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  value: number;
}

interface ActionModalsProps {
  visible: boolean;
  type: 'send' | 'receive' | 'buy' | 'stake' | 'swap';
  onClose: () => void;
  selectedToken?: PortfolioToken | null;
  tokens: PortfolioToken[];
}

export const ActionModals: React.FC<ActionModalsProps> = ({
  visible,
  type,
  onClose,
  selectedToken,
  tokens,
}) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFromToken, setSelectedFromToken] = useState<PortfolioToken | null>(selectedToken || (tokens.length > 0 ? tokens[0] : null));
  const [selectedToToken, setSelectedToToken] = useState<PortfolioToken | null>(tokens.length > 1 ? tokens[1] : null);
  const [memo, setMemo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stakingPeriod, setStakingPeriod] = useState('30'); // days
  const [slippage, setSlippage] = useState('0.5'); // percentage
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedToken) {
      setSelectedFromToken(selectedToken);
    }
  }, [selectedToken]);

  const generateWalletAddress = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '0x';
    for (let i = 0; i < 40; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const walletAddress = generateWalletAddress();

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Address copied to clipboard');
  };

  const handleSend = async () => {
    if (!amount || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > (selectedFromToken?.balance || 0)) {
      Alert.alert('Error', 'Invalid amount');
      return;
    }

    setIsProcessing(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Transaction Sent!',
        `Successfully sent ${amount} ${selectedFromToken?.symbol} to ${address.slice(0, 6)}...${address.slice(-4)}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 2000);
  };

  const handleReceive = () => {
    copyToClipboard(walletAddress);
    Alert.alert(
      'Share Address',
      'Your wallet address has been copied to clipboard. Share it to receive payments.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleBuy = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Purchase Initiated!',
        `Redirecting to payment processor to buy $${amount} worth of ${selectedFromToken?.symbol}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 1500);
  };

  const handleStake = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount to stake');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > (selectedFromToken?.balance || 0)) {
      Alert.alert('Error', 'Invalid staking amount');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      const apr = 8.5; // Mock APR
      const dailyReturn = (numAmount * apr / 100) / 365;
      Alert.alert(
        'Staking Successful!',
        `Staked ${amount} ${selectedFromToken?.symbol} for ${stakingPeriod} days\nExpected daily return: ~${dailyReturn.toFixed(4)} ${selectedFromToken?.symbol}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 2000);
  };

  const handleSwap = async () => {
    if (!amount || !selectedFromToken || !selectedToToken) {
      Alert.alert('Error', 'Please select tokens and enter amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > selectedFromToken.balance) {
      Alert.alert('Error', 'Invalid swap amount');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      const exchangeRate = selectedFromToken.price / selectedToToken.price;
      const receiveAmount = numAmount * exchangeRate;
      const slippageAmount = receiveAmount * (parseFloat(slippage) / 100);
      const finalAmount = receiveAmount - slippageAmount;
      
      Alert.alert(
        'Swap Successful!',
        `Swapped ${amount} ${selectedFromToken.symbol} for ~${finalAmount.toFixed(6)} ${selectedToToken.symbol}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 2500);
  };

  const renderSendModal = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Send {selectedFromToken?.symbol}</Text>
      
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>
          {selectedFromToken?.balance} {selectedFromToken?.symbol}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Recipient Address</Text>
        <TextInput
          style={styles.textInput}
          placeholder="0x... or wallet address"
          placeholderTextColor={Colors.textSecondary}
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Amount</Text>
        <View style={styles.amountInput}>
          <TextInput
            style={[styles.textInput, styles.amountField]}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity 
            style={styles.maxButton}
            onPress={() => setAmount(selectedFromToken?.balance.toString() || '')}
          >
            <Text style={styles.maxButtonText}>MAX</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Memo (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Transaction note"
          placeholderTextColor={Colors.textSecondary}
          value={memo}
          onChangeText={setMemo}
        />
      </View>

      <View style={styles.transactionInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Network Fee</Text>
          <Text style={styles.infoValue}>~0.000025 SOL</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total</Text>
          <Text style={styles.infoValue}>
            {amount ? (parseFloat(amount) + 0.000025).toFixed(6) : '0.000025'} {selectedFromToken?.symbol}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, isProcessing && styles.processingButton]}
        onPress={handleSend}
        disabled={isProcessing}
      >
        <LinearGradient
          colors={isProcessing ? [Colors.border, Colors.border] : [Colors.primary, Colors.accent]}
          style={styles.actionButtonGradient}
        >
          {isProcessing ? (
            <Text style={styles.actionButtonText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="send" size={20} color={Colors.text} />
              <Text style={styles.actionButtonText}>Send {selectedFromToken?.symbol}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderReceiveModal = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Receive {selectedFromToken?.symbol}</Text>
      
      <View style={styles.qrContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.accent]}
          style={styles.qrPlaceholder}
        >
          <Ionicons name="qr-code" size={100} color={Colors.text} />
        </LinearGradient>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Your Wallet Address</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText}>{walletAddress}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => copyToClipboard(walletAddress)}
          >
            <Ionicons name="copy" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.warningBox}>
        <Ionicons name="warning" size={20} color={Colors.warning} />
        <Text style={styles.warningText}>
          Only send {selectedFromToken?.symbol} to this address. Sending other tokens may result in permanent loss.
        </Text>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={handleReceive}>
        <LinearGradient
          colors={[Colors.accent, Colors.primaryLight]}
          style={styles.actionButtonGradient}
        >
          <Ionicons name="share" size={20} color={Colors.text} />
          <Text style={styles.actionButtonText}>Share Address</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderBuyModal = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Buy {selectedFromToken?.symbol}</Text>
      
      <View style={styles.priceInfo}>
        <Text style={styles.priceLabel}>Current Price</Text>
        <Text style={styles.priceValue}>
          ${selectedFromToken?.price.toLocaleString()}
        </Text>
        <Text style={[styles.priceChange, {
          color: (selectedFromToken?.change24h || 0) >= 0 ? Colors.success : Colors.error
        }]}>
          {(selectedFromToken?.change24h || 0) >= 0 ? '+' : ''}{selectedFromToken?.change24h}% (24h)
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Amount (USD)</Text>
        <View style={styles.amountInput}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={[styles.textInput, styles.buyAmountField]}
            placeholder="100.00"
            placeholderTextColor={Colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {amount && selectedFromToken && (
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseLabel}>You will receive approximately</Text>
          <Text style={styles.purchaseAmount}>
            {(parseFloat(amount) / selectedFromToken.price).toFixed(6)} {selectedFromToken.symbol}
          </Text>
        </View>
      )}

      <View style={styles.paymentMethods}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity style={styles.paymentMethod}>
          <Ionicons name="card" size={24} color={Colors.primary} />
          <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, isProcessing && styles.processingButton]}
        onPress={handleBuy}
        disabled={isProcessing}
      >
        <LinearGradient
          colors={isProcessing ? [Colors.border, Colors.border] : [Colors.success, '#00A844']}
          style={styles.actionButtonGradient}
        >
          {isProcessing ? (
            <Text style={styles.actionButtonText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="card" size={20} color={Colors.text} />
              <Text style={styles.actionButtonText}>Buy ${amount}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStakeModal = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Stake {selectedFromToken?.symbol}</Text>
      
      <View style={styles.stakingInfo}>
        <View style={styles.stakingCard}>
          <Text style={styles.stakingLabel}>Current APR</Text>
          <Text style={styles.stakingAPR}>8.5%</Text>
        </View>
        <View style={styles.stakingCard}>
          <Text style={styles.stakingLabel}>Min. Period</Text>
          <Text style={styles.stakingPeriod}>7 days</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Amount to Stake</Text>
        <View style={styles.amountInput}>
          <TextInput
            style={[styles.textInput, styles.amountField]}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity 
            style={styles.maxButton}
            onPress={() => setAmount(selectedFromToken?.balance.toString() || '')}
          >
            <Text style={styles.maxButtonText}>MAX</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Staking Period (Days)</Text>
        <View style={styles.periodSelector}>
          {['7', '30', '90', '365'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, stakingPeriod === period && styles.periodButtonActive]}
              onPress={() => setStakingPeriod(period)}
            >
              <Text style={[styles.periodButtonText, stakingPeriod === period && styles.periodButtonTextActive]}>
                {period}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {amount && (
        <View style={styles.rewardsInfo}>
          <Text style={styles.rewardsLabel}>Expected Rewards</Text>
          <Text style={styles.rewardsAmount}>
            ~{((parseFloat(amount) * 8.5 / 100) * (parseInt(stakingPeriod) / 365)).toFixed(6)} {selectedFromToken?.symbol}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.actionButton, isProcessing && styles.processingButton]}
        onPress={handleStake}
        disabled={isProcessing}
      >
        <LinearGradient
          colors={isProcessing ? [Colors.border, Colors.border] : [Colors.primary, Colors.accent]}
          style={styles.actionButtonGradient}
        >
          {isProcessing ? (
            <Text style={styles.actionButtonText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="trending-up" size={20} color={Colors.text} />
              <Text style={styles.actionButtonText}>Stake {selectedFromToken?.symbol}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderSwapModal = () => (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Swap Tokens</Text>
      
      <View style={styles.swapContainer}>
        <View style={styles.swapTokenSelector}>
          <Text style={styles.swapLabel}>From</Text>
          <TouchableOpacity style={styles.tokenSelector}>
            <View style={styles.tokenSelectorContent}>
              <TokenImage
                symbol={selectedFromToken?.symbol || 'SOL'}
                size={32}
                borderRadius={16}
                style={{ marginRight: 12 }}
              />
              <View>
                <Text style={styles.tokenSymbol}>{selectedFromToken?.symbol}</Text>
                <Text style={styles.tokenBalance}>Balance: {selectedFromToken?.balance}</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.swapAmountInput}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity style={styles.swapButton}>
          <Ionicons name="swap-vertical" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <View style={styles.swapTokenSelector}>
          <Text style={styles.swapLabel}>To</Text>
          <TouchableOpacity style={styles.tokenSelector}>
            <View style={styles.tokenSelectorContent}>
              <TokenImage
                symbol={selectedToToken?.symbol || 'ETH'}
                size={32}
                borderRadius={16}
                style={{ marginRight: 12 }}
              />
              <View>
                <Text style={styles.tokenSymbol}>{selectedToToken?.symbol}</Text>
                <Text style={styles.tokenBalance}>Balance: {selectedToToken?.balance}</Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.swapAmountOutput}>
            <Text style={styles.swapOutputAmount}>
              {amount && selectedFromToken && selectedToToken ? 
                ((parseFloat(amount) * selectedFromToken.price) / selectedToToken.price).toFixed(6) : 
                '0.00'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.swapSettings}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Slippage Tolerance</Text>
          <View style={styles.slippageSelector}>
            <TextInput
              style={styles.slippageInput}
              value={slippage}
              onChangeText={setSlippage}
              keyboardType="decimal-pad"
            />
            <Text style={styles.slippagePercent}>%</Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Network Fee</Text>
          <Text style={styles.settingValue}>~0.000025 SOL</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, isProcessing && styles.processingButton]}
        onPress={handleSwap}
        disabled={isProcessing}
      >
        <LinearGradient
          colors={isProcessing ? [Colors.border, Colors.border] : [Colors.warning, '#FF9500']}
          style={styles.actionButtonGradient}
        >
          {isProcessing ? (
            <Text style={styles.actionButtonText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="swap-horizontal" size={20} color={Colors.text} />
              <Text style={styles.actionButtonText}>Swap Tokens</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderModalContent = () => {
    switch (type) {
      case 'send':
        return renderSendModal();
      case 'receive':
        return renderReceiveModal();
      case 'buy':
        return renderBuyModal();
      case 'stake':
        return renderStakeModal();
      case 'swap':
        return renderSwapModal();
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BlurView intensity={100} style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderModalContent()}
          </ScrollView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 0,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    padding: 24,
    paddingTop: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  balanceInfo: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInput: {
    position: 'relative',
  },
  amountField: {
    paddingRight: 80,
  },
  buyAmountField: {
    paddingLeft: 40,
  },
  maxButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  maxButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  currencySymbol: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    zIndex: 1,
  },
  transactionInfo: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  addressBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.warning,
    marginLeft: 12,
  },
  priceInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  purchaseInfo: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  purchaseLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  purchaseAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  stakingInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  stakingCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  stakingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  stakingAPR: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.success,
  },
  stakingPeriod: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: Colors.text,
  },
  rewardsInfo: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  rewardsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rewardsAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
  },
  swapContainer: {
    marginBottom: 24,
  },
  swapTokenSelector: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  swapLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tokenSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  tokenSelectorImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  tokenBalance: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  swapAmountInput: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    padding: 0,
  },
  swapButton: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginVertical: 8,
  },
  swapAmountOutput: {
    marginTop: 12,
  },
  swapOutputAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  swapSettings: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  slippageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slippageInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 14,
  },
  slippagePercent: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  processingButton: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default ActionModals; 