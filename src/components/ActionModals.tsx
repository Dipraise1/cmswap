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
  imageUrl?: string;
}

interface ActionModalsProps {
  visible: boolean;
  type: 'send' | 'receive' | 'buy' | 'stake' | 'swap' | 'trade' | 'lend' | 'bridge' | 'nft' | 'analytics';
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
  const [selectedChain, setSelectedChain] = useState('Ethereum');
  
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
      const exchangeRate = selectedToToken.price / selectedFromToken.price;
      const receiveAmount = numAmount * exchangeRate;
      Alert.alert(
        'Swap Successful!',
        `Swapped ${amount} ${selectedFromToken.symbol} for ${receiveAmount.toFixed(6)} ${selectedToToken.symbol}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 2000);
  };

  const handleTrade = async () => {
    if (!amount || !selectedFromToken) {
      Alert.alert('Error', 'Please select a token and enter amount');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Trade Order Placed!',
        `Market order to trade ${amount} ${selectedFromToken?.symbol} has been placed successfully.`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 1500);
  };

  const handleLend = async () => {
    if (!amount || !selectedFromToken) {
      Alert.alert('Error', 'Please select a token and enter amount to lend');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > (selectedFromToken?.balance || 0)) {
      Alert.alert('Error', 'Invalid lending amount');
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      const apy = 12.5; // Mock APY
      const dailyReturn = (numAmount * apy / 100) / 365;
      Alert.alert(
        'Lending Successful!',
        `Lent ${amount} ${selectedFromToken?.symbol} at ${apy}% APY\nExpected daily return: ~${dailyReturn.toFixed(6)} ${selectedFromToken?.symbol}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }, 2000);
  };

  const handleBridge = () => {
    Alert.alert(
      'Bridge Feature',
      'Cross-chain bridge functionality coming soon! This will allow you to transfer assets between different blockchains.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleNFT = () => {
    Alert.alert(
      'NFT Marketplace',
      'NFT trading and marketplace features coming soon! Buy, sell, and trade your favorite NFTs.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleAnalytics = () => {
    Alert.alert(
      'Advanced Analytics',
      'Pro analytics dashboard coming soon! Get detailed insights into your portfolio performance, DeFi yields, and market trends.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const renderSendModal = () => (
    <View style={styles.modalContent}>
      <View style={styles.sendHeader}>
        <Text style={styles.modalTitle}>Send</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sendForm}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Select Asset</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tokenScrollView}
            contentContainerStyle={styles.tokenScrollContent}
          >
            {tokens.map((token) => (
              <TouchableOpacity
                key={token.id}
                style={[styles.tokenCard, selectedFromToken?.id === token.id && styles.tokenCardActive]}
                onPress={() => setSelectedFromToken(token)}
                activeOpacity={0.7}
              >
                <View style={styles.tokenCardContent}>
                  <View style={styles.tokenCardIcon}>
                    {token.imageUrl ? (
                      <Image 
                        source={{ uri: token.imageUrl }} 
                        style={styles.tokenImage}
                        defaultSource={require('../../assets/icon.png')}
                      />
                    ) : (
                      <Text style={styles.tokenCardSymbol}>{token.symbol}</Text>
                    )}
                  </View>
                  <Text style={styles.tokenCardName}>{token.name}</Text>
                  <Text style={styles.tokenCardBalance}>{token.balance}</Text>
                  <Text style={styles.tokenCardValue}>
                    ${((token.balance || 0) * (token.price || 0)).toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedFromToken && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceCardLabel}>Available Balance</Text>
            <Text style={styles.balanceCardAmount}>
              {selectedFromToken?.balance} {selectedFromToken?.symbol}
            </Text>
            <Text style={styles.balanceCardValue}>
              ≈ ${((selectedFromToken?.balance || 0) * (selectedFromToken?.price || 0)).toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sendForm}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Recipient Address</Text>
          <View style={styles.addressInputCard}>
            <TextInput
              style={styles.addressInput}
              placeholder="Enter wallet address or scan QR"
              placeholderTextColor={Colors.textSecondary}
              value={address}
              onChangeText={setAddress}
              autoCapitalize="none"
              multiline={true}
              numberOfLines={2}
            />
            <TouchableOpacity style={styles.qrScanButton} activeOpacity={0.7}>
              <Ionicons name="qr-code-outline" size={20} color={Colors.brightBlue} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.amountCard}>
            <View style={styles.amountInputContainer}>
              <TextInput
                style={styles.amountInputField}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.amountCurrency}>{selectedFromToken?.symbol}</Text>
            </View>
            <View style={styles.amountActions}>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => setAmount(((selectedFromToken?.balance || 0) * 0.25).toString())}
              >
                <Text style={styles.percentageButtonText}>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => setAmount(((selectedFromToken?.balance || 0) * 0.5).toString())}
              >
                <Text style={styles.percentageButtonText}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.percentageButton}
                onPress={() => setAmount(((selectedFromToken?.balance || 0) * 0.75).toString())}
              >
                <Text style={styles.percentageButtonText}>75%</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.maxAmountButton}
                onPress={() => setAmount(selectedFromToken?.balance.toString() || '')}
              >
                <Text style={styles.maxAmountButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
            {amount && (
              <Text style={styles.amountUsdValue}>
                ≈ ${(parseFloat(amount) * (selectedFromToken?.price || 0)).toFixed(2)} USD
              </Text>
            )}
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Memo (Optional)</Text>
          <View style={styles.memoInputCard}>
            <TextInput
              style={styles.memoInput}
              placeholder="Add a note for this transaction"
              placeholderTextColor={Colors.textSecondary}
              value={memo}
              onChangeText={setMemo}
              maxLength={100}
            />
          </View>
        </View>
      </View>

      <View style={styles.feeCard}>
        <View style={styles.feeHeader}>
          <Text style={styles.feeTitle}>Transaction Summary</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Amount</Text>
          <Text style={styles.feeValue}>{amount || '0'} {selectedFromToken?.symbol}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Network Fee</Text>
          <Text style={styles.feeValue}>~0.000025 {selectedFromToken?.symbol}</Text>
        </View>
        <View style={styles.feeDivider} />
        <View style={styles.feeRow}>
          <Text style={styles.feeTotalLabel}>Total</Text>
          <Text style={styles.feeTotalValue}>
            {amount ? (parseFloat(amount) + 0.000025).toFixed(6) : '0.000025'} {selectedFromToken?.symbol}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.sendButton, (!amount || !address || isProcessing) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!amount || !address || isProcessing}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={(!amount || !address || isProcessing) ? [Colors.border, Colors.border] : [Colors.brightBlue, Colors.accent]}
          style={styles.sendButtonGradient}
        >
          {isProcessing ? (
            <Text style={styles.sendButtonText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="white" />
              <Text style={styles.sendButtonText}>Send {selectedFromToken?.symbol}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderReceiveModal = () => {
    const supportedChains = ['Ethereum', 'Solana', 'Bitcoin', 'Cardano', 'Polygon', 'BSC'];
    
    const getChainIcon = (chain: string) => {
      switch (chain) {
        case 'Ethereum': return 'logo-ethereum' as any;
        case 'Solana': return 'flash' as any;
        case 'Bitcoin': return 'logo-bitcoin' as any;
        case 'Cardano': return 'heart' as any;
        case 'Polygon': return 'triangle' as any;
        case 'BSC': return 'logo-usd' as any;
        default: return 'link' as any;
      }
    };

    const getChainColor = (chain: string) => {
      switch (chain) {
        case 'Ethereum': return '#627EEA';
        case 'Solana': return '#9945FF';
        case 'Bitcoin': return '#F7931A';
        case 'Cardano': return '#0033AD';
        case 'Polygon': return '#8247E5';
        case 'BSC': return '#F3BA2F';
        default: return Colors.brightBlue;
      }
    };

    return (
      <View style={styles.modalContent}>
        <View style={styles.receiveHeader}>
          <Text style={styles.modalTitle}>Receive</Text>
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenBadgeText}>{selectedFromToken?.symbol}</Text>
          </View>
        </View>
        
        <View style={styles.networkSection}>
          <Text style={styles.sectionTitle}>Select Network</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.chainScrollView}
            contentContainerStyle={styles.chainScrollContent}
          >
            {supportedChains.map((chain) => (
              <TouchableOpacity
                key={chain}
                style={[styles.networkCard, selectedChain === chain && styles.networkCardActive]}
                onPress={() => setSelectedChain(chain)}
                activeOpacity={0.7}
              >
                <View style={[styles.networkIcon, { backgroundColor: getChainColor(chain) }]}>
                  <Ionicons name={getChainIcon(chain)} size={24} color="white" />
                </View>
                <Text style={[styles.networkName, selectedChain === chain && styles.networkNameActive]}>
                  {chain}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>QR Code</Text>
          <View style={styles.qrCodeContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F9FA']}
              style={styles.qrCodeBackground}
            >
              <View style={styles.qrCodeInner}>
                <Ionicons name="qr-code" size={120} color={getChainColor(selectedChain)} />
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Wallet Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>{selectedChain} Network</Text>
              <Text style={styles.addressValue}>{walletAddress}</Text>
            </View>
            <TouchableOpacity 
              style={styles.copyIconButton}
              onPress={() => copyToClipboard(walletAddress)}
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={24} color={getChainColor(selectedChain)} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning-outline" size={20} color={Colors.warning} />
          </View>
          <Text style={styles.warningMessage}>
            Only send {selectedFromToken?.symbol} on {selectedChain} network to this address. 
            Sending from other networks may result in permanent loss of funds.
          </Text>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleReceive} activeOpacity={0.8}>
          <LinearGradient
            colors={[getChainColor(selectedChain), getChainColor(selectedChain) + 'DD']}
            style={styles.shareButtonGradient}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text style={styles.shareButtonText}>Share Address</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

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

  const renderSwapModal = () => {
    const [showFromTokens, setShowFromTokens] = useState(false);
    const [showToTokens, setShowToTokens] = useState(false);
    const [swapDirection, setSwapDirection] = useState<'from' | 'to'>('from');
    
    // Calculate swap values with realistic slippage and fees
    const calculateSwapOutput = () => {
      if (!amount || !selectedFromToken || !selectedToToken) return '0.00';
      
      const inputAmount = parseFloat(amount);
      const exchangeRate = selectedFromToken.price / selectedToToken.price;
      const slippageDecimal = parseFloat(slippage) / 100;
      const priceImpact = Math.min(inputAmount / 10000, 0.03); // Simulate price impact
      
      // Calculate output with slippage and price impact
      const baseOutput = inputAmount * exchangeRate;
      const outputWithSlippage = baseOutput * (1 - slippageDecimal);
      const finalOutput = outputWithSlippage * (1 - priceImpact);
      
      return finalOutput.toFixed(6);
    };
    
    const calculatePriceImpact = () => {
      if (!amount || !selectedFromToken) return '0.00';
      const inputAmount = parseFloat(amount);
      return Math.min((inputAmount / 10000) * 100, 3).toFixed(2);
    };
    
    const calculateMinReceived = () => {
      const output = parseFloat(calculateSwapOutput());
      const slippageDecimal = parseFloat(slippage) / 100;
      return (output * (1 - slippageDecimal)).toFixed(6);
    };
    
    const getNetworkFee = () => {
      if (!selectedFromToken) return '0.001 ETH';
      
      switch (selectedFromToken.symbol) {
        case 'ETH': return `${(0.003 + Math.random() * 0.002).toFixed(4)} ETH`;
        case 'BTC': return `${(0.0001 + Math.random() * 0.0001).toFixed(5)} BTC`;
        case 'SOL': return `${(0.000025 + Math.random() * 0.000025).toFixed(6)} SOL`;
        case 'BNB': return `${(0.0005 + Math.random() * 0.0003).toFixed(5)} BNB`;
        case 'ADA': return `${(0.17 + Math.random() * 0.1).toFixed(2)} ADA`;
        default: return '0.001 ETH';
      }
    };
    
    const swapTokens = () => {
      const temp = selectedFromToken;
      setSelectedFromToken(selectedToToken);
      setSelectedToToken(temp);
      setAmount('');
    };
    
    const renderTokenSelector = (isFrom: boolean) => (
      <View style={styles.swapTokenCard}>
        <View style={styles.swapTokenHeader}>
          <Text style={styles.swapTokenLabel}>{isFrom ? 'From' : 'To'}</Text>
          {isFrom && amount && (
            <Text style={styles.swapTokenBalance}>
              Balance: {selectedFromToken?.balance || 0} {selectedFromToken?.symbol}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.swapTokenSelector}
          onPress={() => {
            setSwapDirection(isFrom ? 'from' : 'to');
            if (isFrom) setShowFromTokens(true);
            else setShowToTokens(true);
          }}
        >
          <View style={styles.swapTokenSelectorContent}>
            {(isFrom ? selectedFromToken : selectedToToken) ? (
              <>
                {(isFrom ? selectedFromToken : selectedToToken)?.imageUrl ? (
                  <Image 
                    source={{ uri: (isFrom ? selectedFromToken : selectedToToken)?.imageUrl }} 
                    style={styles.swapTokenImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.swapTokenPlaceholder}>
                    <Text style={styles.swapTokenPlaceholderText}>
                      {(isFrom ? selectedFromToken : selectedToToken)?.symbol}
                    </Text>
                  </View>
                )}
                <View style={styles.swapTokenInfo}>
                  <Text style={styles.swapTokenSymbol}>
                    {(isFrom ? selectedFromToken : selectedToToken)?.symbol}
                  </Text>
                  <Text style={styles.swapTokenName}>
                    {(isFrom ? selectedFromToken : selectedToToken)?.name}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.selectTokenText}>Select Token</Text>
            )}
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.swapAmountContainer}>
          {isFrom ? (
            <TextInput
              style={styles.swapAmountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          ) : (
            <View style={styles.swapAmountOutput}>
              <Text style={styles.swapOutputAmount}>
                {calculateSwapOutput()}
              </Text>
            </View>
          )}
          {isFrom && amount && selectedFromToken && (
            <Text style={styles.swapAmountUsd}>
              ≈ ${(parseFloat(amount) * selectedFromToken.price).toFixed(2)}
            </Text>
          )}
          {!isFrom && amount && selectedToToken && (
            <Text style={styles.swapAmountUsd}>
              ≈ ${(parseFloat(calculateSwapOutput()) * selectedToToken.price).toFixed(2)}
            </Text>
          )}
        </View>
        
        {isFrom && amount && (
          <View style={styles.swapQuickAmounts}>
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setAmount(((selectedFromToken?.balance || 0) * 0.25).toString())}
            >
              <Text style={styles.quickAmountText}>25%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setAmount(((selectedFromToken?.balance || 0) * 0.5).toString())}
            >
              <Text style={styles.quickAmountText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setAmount(((selectedFromToken?.balance || 0) * 0.75).toString())}
            >
              <Text style={styles.quickAmountText}>75%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickAmountButton, styles.maxButton]}
              onPress={() => setAmount((selectedFromToken?.balance || 0).toString())}
            >
              <Text style={[styles.quickAmountText, styles.maxButtonText]}>MAX</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
    
    const renderTokenList = (isFrom: boolean) => (
      <Modal visible={isFrom ? showFromTokens : showToTokens} transparent animationType="slide">
        <View style={styles.tokenListOverlay}>
          <View style={styles.tokenListContainer}>
            <View style={styles.tokenListHeader}>
              <Text style={styles.tokenListTitle}>Select Token</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowFromTokens(false);
                  setShowToTokens(false);
                }}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.tokenList}>
              {tokens.map((token) => (
                <TouchableOpacity
                  key={token.id}
                  style={styles.tokenListItem}
                  onPress={() => {
                    if (isFrom) {
                      setSelectedFromToken(token);
                      setShowFromTokens(false);
                    } else {
                      setSelectedToToken(token);
                      setShowToTokens(false);
                    }
                  }}
                >
                  <View style={styles.tokenListItemContent}>
                    {token.imageUrl ? (
                      <Image 
                        source={{ uri: token.imageUrl }} 
                        style={styles.tokenListImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.tokenListPlaceholder}>
                        <Text style={styles.tokenListPlaceholderText}>{token.symbol}</Text>
                      </View>
                    )}
                    <View style={styles.tokenListInfo}>
                      <Text style={styles.tokenListSymbol}>{token.symbol}</Text>
                      <Text style={styles.tokenListName}>{token.name}</Text>
                    </View>
                    <View style={styles.tokenListBalance}>
                      <Text style={styles.tokenListBalanceAmount}>{token.balance}</Text>
                      <Text style={styles.tokenListBalanceValue}>
                        ${(token.balance * token.price).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );

    return (
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Swap</Text>
        
        <View style={styles.swapContainer}>
          {renderTokenSelector(true)}
          
          <TouchableOpacity style={styles.swapDirectionButton} onPress={swapTokens}>
            <View style={styles.swapDirectionIcon}>
              <Ionicons name="swap-vertical" size={20} color={Colors.brightBlue} />
            </View>
          </TouchableOpacity>
          
          {renderTokenSelector(false)}
        </View>
        
        {amount && selectedFromToken && selectedToToken && (
          <View style={styles.swapDetails}>
            <View style={styles.swapDetailRow}>
              <Text style={styles.swapDetailLabel}>Exchange Rate</Text>
              <Text style={styles.swapDetailValue}>
                1 {selectedFromToken.symbol} = {(selectedFromToken.price / selectedToToken.price).toFixed(6)} {selectedToToken.symbol}
              </Text>
            </View>
            
            <View style={styles.swapDetailRow}>
              <Text style={styles.swapDetailLabel}>Price Impact</Text>
              <Text style={[styles.swapDetailValue, parseFloat(calculatePriceImpact()) > 1 ? { color: Colors.error } : { color: Colors.success }]}>
                {calculatePriceImpact()}%
              </Text>
            </View>
            
            <View style={styles.swapDetailRow}>
              <Text style={styles.swapDetailLabel}>Slippage Tolerance</Text>
              <TouchableOpacity style={styles.slippageContainer}>
                <TextInput
                  style={styles.slippageInput}
                  value={slippage}
                  onChangeText={setSlippage}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.slippageText}>%</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.swapDetailRow}>
              <Text style={styles.swapDetailLabel}>Network Fee</Text>
              <Text style={styles.swapDetailValue}>{getNetworkFee()}</Text>
            </View>
            
            <View style={styles.swapDetailRow}>
              <Text style={styles.swapDetailLabel}>Minimum Received</Text>
              <Text style={styles.swapDetailValue}>
                {calculateMinReceived()} {selectedToToken.symbol}
              </Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.swapActionButton, 
            (!amount || !selectedFromToken || !selectedToToken || isProcessing) && styles.swapActionButtonDisabled
          ]}
          onPress={handleSwap}
          disabled={!amount || !selectedFromToken || !selectedToToken || isProcessing}
        >
          <LinearGradient
            colors={(!amount || !selectedFromToken || !selectedToToken || isProcessing) 
              ? [Colors.border, Colors.border] 
              : [Colors.brightBlue, Colors.accent]}
            style={styles.swapActionButtonGradient}
          >
            {isProcessing ? (
              <Text style={styles.swapActionButtonText}>Swapping...</Text>
            ) : (
              <>
                <Ionicons name="swap-horizontal" size={20} color="white" />
                <Text style={styles.swapActionButtonText}>
                  {selectedFromToken && selectedToToken 
                    ? `Swap ${selectedFromToken.symbol} for ${selectedToToken.symbol}` 
                    : 'Select Tokens'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        {renderTokenList(true)}
        {renderTokenList(false)}
      </View>
    );
  };

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
  
  // New Receive Modal Styles
  receiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tokenBadge: {
    backgroundColor: Colors.brightBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tokenBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  networkSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  chainScrollView: {
    flexGrow: 0,
  },
  chainScrollContent: {
    paddingHorizontal: 4,
  },
  networkCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  networkCardActive: {
    borderColor: Colors.brightBlue,
    backgroundColor: Colors.brightBlue + '20',
  },
  networkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  networkName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  networkNameActive: {
    color: Colors.brightBlue,
    fontWeight: '600',
  },
  qrSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeBackground: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrCodeInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressSection: {
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  addressValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  copyIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.warning,
    lineHeight: 20,
  },
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // New Send Modal Styles
  sendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceCardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceCardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  balanceCardValue: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sendForm: {
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  addressInputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 12,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  qrScanButton: {
    padding: 8,
    backgroundColor: Colors.brightBlue + '20',
    borderRadius: 8,
  },
  amountCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountInputField: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    paddingRight: 12,
  },
  amountCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  amountActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  percentageButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  percentageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  maxAmountButton: {
    flex: 1,
    backgroundColor: Colors.brightBlue,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  maxAmountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  amountUsdValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  memoInputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memoInput: {
    fontSize: 16,
    color: Colors.text,
    minHeight: 20,
  },
  feeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feeHeader: {
    marginBottom: 16,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  feeValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  feeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  feeTotalLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  feeTotalValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  tokenScrollView: {
    flexGrow: 0,
  },
  tokenScrollContent: {
    paddingHorizontal: 4,
  },
  tokenCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tokenCardActive: {
    borderColor: Colors.brightBlue,
    backgroundColor: Colors.brightBlue + '20',
  },
  tokenCardContent: {
    alignItems: 'center',
  },
  tokenCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenCardSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  tokenCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tokenCardBalance: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  tokenCardValue: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tokenImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  
  // New Swap Styles
  swapContainer: {
    marginBottom: 24,
  },
  swapTokenCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swapTokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  swapTokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  swapTokenBalance: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  swapTokenSelector: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swapTokenSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swapTokenImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  swapTokenPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  swapTokenPlaceholderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  swapTokenInfo: {
    flex: 1,
  },
  swapTokenSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  swapTokenName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectTokenText: {
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  swapAmountContainer: {
    marginBottom: 12,
  },
  swapAmountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  swapAmountOutput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  swapOutputAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  swapAmountUsd: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  swapQuickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  swapQuickAmountButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swapQuickAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  swapMaxButton: {
    backgroundColor: Colors.brightBlue,
  },
  maxButtonText: {
    color: 'white',
  },
  swapDirectionButton: {
    alignSelf: 'center',
    marginVertical: -8,
    zIndex: 1,
  },
  swapDirectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  swapDetails: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swapDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  swapDetailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  swapDetailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  slippageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slippageInput: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  slippageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  swapActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  swapActionButtonDisabled: {
    opacity: 0.5,
  },
  swapActionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  swapActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Token List Modal Styles
  tokenListOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  tokenListContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  tokenListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tokenListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  tokenList: {
    flex: 1,
  },
  tokenListItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tokenListItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tokenListImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenListPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenListPlaceholderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  tokenListInfo: {
    flex: 1,
  },
  tokenListSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  tokenListName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tokenListBalance: {
    alignItems: 'flex-end',
  },
  tokenListBalanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  tokenListBalanceValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default ActionModals; 