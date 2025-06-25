import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

// Real crypto tokens with live data structure
const availableTokens = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'BTC',
    balance: 0.00,
    price: 96420.32,
    change24h: 1.45,
    imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
  },
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH',
    balance: 0.00,
    price: 3842.15,
    change24h: 2.87,
    imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL',
    balance: 0.00,
    price: 245.67,
    change24h: 5.23,
    imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
  },
  { 
    id: 'usd-coin', 
    name: 'USD Coin', 
    symbol: 'USDC',
    balance: 0.00,
    price: 1.00,
    change24h: 0.01,
    imageUrl: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
  },
  { 
    id: 'binancecoin', 
    name: 'BNB', 
    symbol: 'BNB',
    balance: 0.00,
    price: 718.45,
    change24h: -1.23,
    imageUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
  },
  { 
    id: 'cardano', 
    name: 'Cardano', 
    symbol: 'ADA',
    balance: 0.00,
    price: 1.08,
    change24h: 3.45,
    imageUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
  },
];

const SwapScreen: React.FC = () => {
  const [fromToken, setFromToken] = useState(availableTokens[2]); // SOL
  const [toToken, setToToken] = useState(availableTokens[3]); // USDC
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokens, setTokens] = useState(availableTokens);

  // Calculate real-time swap output
  useEffect(() => {
    if (fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0) {
      const inputAmount = parseFloat(fromAmount);
      const exchangeRate = fromToken.price / toToken.price;
      const slippageDecimal = parseFloat(slippage) / 100;
      const priceImpact = Math.min(inputAmount / 10000, 0.03); // Simulate price impact
      
      // Calculate output with slippage and price impact
      const baseOutput = inputAmount * exchangeRate;
      const outputWithSlippage = baseOutput * (1 - slippageDecimal);
      const finalOutput = outputWithSlippage * (1 - priceImpact);
      
      setToAmount(finalOutput.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken, slippage]);

  const calculatePriceImpact = () => {
    if (!fromAmount || !fromToken) return '0.00';
    const inputAmount = parseFloat(fromAmount);
    return Math.min((inputAmount / 10000) * 100, 3).toFixed(2);
  };

  const calculateMinReceived = () => {
    if (!toAmount) return '0.00';
    const output = parseFloat(toAmount);
    const slippageDecimal = parseFloat(slippage) / 100;
    return (output * (1 - slippageDecimal)).toFixed(6);
  };

  const getNetworkFee = () => {
    if (!fromToken) return '0.001 ETH';
    
    switch (fromToken.symbol) {
      case 'ETH': return `${(0.003 + Math.random() * 0.002).toFixed(4)} ETH`;
      case 'BTC': return `${(0.0001 + Math.random() * 0.0001).toFixed(5)} BTC`;
      case 'SOL': return `${(0.000025 + Math.random() * 0.000025).toFixed(6)} SOL`;
      case 'BNB': return `${(0.0005 + Math.random() * 0.0003).toFixed(5)} BNB`;
      case 'ADA': return `${(0.17 + Math.random() * 0.1).toFixed(2)} ADA`;
      default: return '0.001 ETH';
    }
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || !fromToken || !toToken || parseFloat(fromAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(fromAmount) > fromToken.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setIsSwapping(true);
    
    // Simulate swap transaction
    setTimeout(() => {
      setIsSwapping(false);
      Alert.alert(
        'Swap Successful!',
        `Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        [{ text: 'OK', onPress: () => {
          setFromAmount('');
          setToAmount('');
        }}]
      );
    }, 3000);
  };

  const renderTokenSelector = (isFrom: boolean) => {
    const selectedToken = isFrom ? fromToken : toToken;
    const amount = isFrom ? fromAmount : toAmount;
    
    return (
      <View style={styles.tokenCard}>
        <View style={styles.tokenHeader}>
          <Text style={styles.tokenLabel}>{isFrom ? 'From' : 'To'}</Text>
          {isFrom && selectedToken && (
            <Text style={styles.tokenBalance}>
              Balance: {selectedToken.balance} {selectedToken.symbol}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.tokenSelector}
          onPress={() => {
            if (isFrom) setShowFromTokens(true);
            else setShowToTokens(true);
          }}
        >
          <View style={styles.tokenSelectorContent}>
            {selectedToken ? (
              <>
                <Image 
                  source={{ uri: selectedToken.imageUrl }} 
                  style={styles.tokenImage}
                  resizeMode="contain"
                />
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{selectedToken.symbol}</Text>
                  <Text style={styles.tokenName}>{selectedToken.name}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.selectTokenText}>Select Token</Text>
            )}
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.amountContainer}>
          {isFrom ? (
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textSecondary}
              value={fromAmount}
              onChangeText={setFromAmount}
              keyboardType="decimal-pad"
            />
          ) : (
            <View style={styles.amountOutput}>
              <Text style={styles.outputAmount}>{amount || '0.00'}</Text>
            </View>
          )}
          {amount && selectedToken && (
            <Text style={styles.amountUsd}>
              ≈ ${(parseFloat(amount) * selectedToken.price).toFixed(2)}
            </Text>
          )}
        </View>
        
        {isFrom && fromAmount && selectedToken && (
          <View style={styles.quickAmounts}>
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setFromAmount((selectedToken.balance * 0.25).toString())}
            >
              <Text style={styles.quickAmountText}>25%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setFromAmount((selectedToken.balance * 0.5).toString())}
            >
              <Text style={styles.quickAmountText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAmountButton}
              onPress={() => setFromAmount((selectedToken.balance * 0.75).toString())}
            >
              <Text style={styles.quickAmountText}>75%</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickAmountButton, styles.maxButton]}
              onPress={() => setFromAmount(selectedToken.balance.toString())}
            >
              <Text style={[styles.quickAmountText, styles.maxButtonText]}>MAX</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTokenList = (isFrom: boolean) => (
    <Modal 
      visible={isFrom ? showFromTokens : showToTokens} 
      transparent 
      animationType="slide"
      onRequestClose={() => {
        setShowFromTokens(false);
        setShowToTokens(false);
      }}
    >
      <View style={styles.tokenListOverlay}>
        <TouchableOpacity 
          style={styles.tokenListBackdrop}
          activeOpacity={1}
          onPress={() => {
            setShowFromTokens(false);
            setShowToTokens(false);
          }}
        />
        <View style={styles.tokenListContainer}>
          <View style={styles.tokenListHeader}>
            <Text style={styles.tokenListTitle}>Select Token</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                setShowFromTokens(false);
                setShowToTokens(false);
              }}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.tokenList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tokenListContent}
          >
            {tokens.map((token) => (
              <TouchableOpacity
                key={token.id}
                style={styles.tokenListItem}
                onPress={() => {
                  if (isFrom) {
                    setFromToken(token);
                    setShowFromTokens(false);
                  } else {
                    setToToken(token);
                    setShowToTokens(false);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.tokenListItemContent}>
                  <Image 
                    source={{ uri: token.imageUrl }} 
                    style={styles.tokenListImage}
                    resizeMode="contain"
                  />
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Swap</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.swapContainer}>
          {renderTokenSelector(true)}
          
          <TouchableOpacity style={styles.swapDirectionButton} onPress={swapTokens}>
            <View style={styles.swapDirectionIcon}>
              <Ionicons name="swap-vertical" size={20} color={Colors.brightBlue} />
            </View>
          </TouchableOpacity>
          
          {renderTokenSelector(false)}
        </View>
        
        {fromAmount && fromToken && toToken && (
          <View style={styles.swapDetails}>
            <Text style={styles.detailsTitle}>Transaction Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exchange Rate</Text>
              <Text style={styles.detailValue}>
                1 {fromToken.symbol} = {(fromToken.price / toToken.price).toFixed(6)} {toToken.symbol}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price Impact</Text>
              <Text style={[
                styles.detailValue, 
                parseFloat(calculatePriceImpact()) > 1 ? { color: Colors.error } : { color: Colors.success }
              ]}>
                {calculatePriceImpact()}%
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slippage Tolerance</Text>
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
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network Fee</Text>
              <Text style={styles.detailValue}>{getNetworkFee()}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Minimum Received</Text>
              <Text style={styles.detailValue}>
                {calculateMinReceived()} {toToken.symbol}
              </Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.swapButton, 
            (!fromAmount || !fromToken || !toToken || isSwapping || parseFloat(fromAmount) <= 0) && styles.swapButtonDisabled
          ]}
          onPress={handleSwap}
          disabled={!fromAmount || !fromToken || !toToken || isSwapping || parseFloat(fromAmount) <= 0}
        >
          <LinearGradient
            colors={(!fromAmount || !fromToken || !toToken || isSwapping || parseFloat(fromAmount) <= 0) 
              ? [Colors.border, Colors.border] 
              : [Colors.brightBlue, Colors.accent]}
            style={styles.swapButtonGradient}
          >
            {isSwapping ? (
              <Text style={styles.swapButtonText}>Swapping...</Text>
            ) : (
              <>
                <Ionicons name="swap-horizontal" size={20} color="white" />
                <Text style={styles.swapButtonText}>
                  {fromToken && toToken 
                    ? `Swap ${fromToken.symbol} for ${toToken.symbol}` 
                    : 'Select Tokens'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        {renderTokenList(true)}
        {renderTokenList(false)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  swapContainer: {
    marginBottom: 24,
  },
  tokenCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tokenBalance: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tokenSelector: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tokenSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  tokenName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectTokenText: {
    fontSize: 16,
    color: Colors.textSecondary,
    flex: 1,
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountInput: {
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
  amountOutput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  outputAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  amountUsd: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  maxButton: {
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
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
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
  swapButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  swapButtonDisabled: {
    opacity: 0.5,
  },
  swapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  swapButtonText: {
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
  tokenListBackdrop: {
    flex: 1,
  },
  tokenListContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    minHeight: 500,
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
  tokenListContent: {
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
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

export default SwapScreen; 