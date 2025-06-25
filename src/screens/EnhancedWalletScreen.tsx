import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { ActionModals } from '../components/ActionModals';

const { width: screenWidth } = Dimensions.get('window');

// Crypto tokens with real portfolio balances and CoinGecko images
const baseTokens = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin', 
    symbol: 'BTC',
    balance: 0.00,
    price: 96420.32,
    change24h: 1.45,
    value: 0.00,
    imageUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    type: 'image'
  },
  { 
    id: 'ethereum', 
    name: 'Ethereum', 
    symbol: 'ETH',
    balance: 0.00,
    price: 3842.15,
    change24h: 2.87,
    value: 0.00,
    imageUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    type: 'image'
  },
  { 
    id: 'solana', 
    name: 'Solana', 
    symbol: 'SOL',
    balance: 0.00,
    price: 245.67,
    change24h: 5.23,
    value: 0.00,
    imageUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    type: 'image'
  },
  { 
    id: 'usd-coin', 
    name: 'USD Coin', 
    symbol: 'USDC',
    balance: 0.00,
    price: 1.00,
    change24h: 0.01,
    value: 0.00,
    imageUrl: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    type: 'image'
  },
  { 
    id: 'binancecoin', 
    name: 'BNB', 
    symbol: 'BNB',
    balance: 0.00,
    price: 718.45,
    change24h: -1.23,
    value: 0.00,
    imageUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    type: 'image'
  },
  { 
    id: 'cardano', 
    name: 'Cardano', 
    symbol: 'ADA',
    balance: 0.00,
    price: 1.08,
    change24h: 3.45,
    value: 0.00,
    imageUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    type: 'image'
  },
];

// Real upcoming tokens from CoinGecko trending API
const baseUpcomingTokens = [
  { 
    id: 'shiba-inu', 
    name: 'Shiba Inu', 
    symbol: 'SHIB',
    launchDate: 'Available Now',
    imageUrl: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    type: 'image'
  },
  { 
    id: 'dogecoin', 
    name: 'Dogecoin', 
    symbol: 'DOGE',
    launchDate: 'Available Now',
    imageUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    type: 'image'
  },
  { 
    id: 'pepe', 
    name: 'Pepe', 
    symbol: 'PEPE',
    launchDate: 'Available Now',
    imageUrl: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    type: 'image'
  },
  { 
    id: 'chainlink', 
    name: 'Chainlink', 
    symbol: 'LINK',
    launchDate: 'Available Now',
    imageUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    type: 'image'
  },
];

const quickActions = [
  { id: 'buy', title: 'Buy', icon: 'credit-card', type: 'material' },
  { id: 'send', title: 'Send', icon: 'send', type: 'material' },
  { id: 'swap', title: 'Swap', icon: 'swap-horizontal', type: 'ionicon' },
  { id: 'receive', title: 'Receive', icon: 'qrcode-scan', type: 'material' },
];

export const EnhancedWalletScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('tokens');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'send' | 'receive' | 'buy'>('send');
  const [tokens, setTokens] = useState(baseTokens.map(token => ({ ...token, price: 'Loading...' })));
  const [upcomingTokens, setUpcomingTokens] = useState(baseUpcomingTokens.map(token => ({ ...token, price: 'Loading...' })));
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Fetch live prices and trending tokens from CoinGecko API
  const fetchLivePrices = async () => {
    try {
      setIsLoadingPrices(true);
      
      // Fetch trending coins from CoinGecko
      const trendingResponse = await fetch('https://api.coingecko.com/api/v3/search/trending');
      let realTrendingTokens = baseUpcomingTokens; // Fallback
      
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        // Get top 4 trending coins
        realTrendingTokens = trendingData.coins.slice(0, 4).map((coin: any) => ({
          id: coin.item.id,
          name: coin.item.name,
          symbol: coin.item.symbol,
          launchDate: 'Trending Now',
          imageUrl: coin.item.large,
          type: 'image',
        }));
      }
      
      // Get all token IDs for price fetching
      const mainTokenIds = baseTokens.map(token => token.id).join(',');
      const trendingTokenIds = realTrendingTokens.map((token: any) => token.id).join(',');
      const allTokenIds = `${mainTokenIds},${trendingTokenIds}`;
      
      // Fetch prices from CoinGecko (free tier)
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${allTokenIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      );
      
      if (!priceResponse.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const priceData = await priceResponse.json();
      
      // Update main tokens with live prices
      const updatedTokens = baseTokens.map(token => ({
        ...token,
        price: priceData[token.id]?.usd ? `$${priceData[token.id].usd.toLocaleString()}` : 'Loading...',
        change24h: priceData[token.id]?.usd_24h_change || 0,
        marketCap: priceData[token.id]?.usd_market_cap || 0,
      }));
      
      // Update trending tokens with live prices
      const updatedTrendingTokens = realTrendingTokens.map((token: any) => ({
        ...token,
        price: priceData[token.id]?.usd ? `$${priceData[token.id].usd.toLocaleString()}` : 'Loading...',
        change24h: priceData[token.id]?.usd_24h_change || 0,
        marketCap: priceData[token.id]?.usd_market_cap || 0,
      }));
      
      setTokens(updatedTokens);
      setUpcomingTokens(updatedTrendingTokens);
      
    } catch (error) {
      console.error('Error fetching live prices:', error);
      
      // Fallback to mock data if API fails
      const mockTokens = baseTokens.map(token => ({
        ...token,
        price: token.symbol === 'BTC' ? '$97,000' : 
               token.symbol === 'ETH' ? '$3,500' : 
               token.symbol === 'USDC' ? '$1.00' : 
               token.symbol === 'BNB' ? '$650' : 
               token.symbol === 'SOL' ? '$200' : '$0.50',
        change24h: Math.random() * 10 - 5, // Random change between -5% and +5%
      }));
      
      const mockUpcomingTokens = baseUpcomingTokens.map(token => ({
        ...token,
        price: token.symbol === 'DOGE' ? '$0.40' : 
               token.symbol === 'SHIB' ? '$0.000025' : 
               token.symbol === 'PEPE' ? '$0.000015' : '$25.00',
        change24h: Math.random() * 20 - 10, // Random change between -10% and +10%
      }));
      
      setTokens(mockTokens);
      setUpcomingTokens(mockUpcomingTokens);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for refresh button
    const rotationLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );
    rotationLoop.start();

    // Fetch live prices on component mount
    fetchLivePrices();

    // Set up interval to refresh prices every 30 seconds
    const priceInterval = setInterval(fetchLivePrices, 30000);

    return () => {
      rotationLoop.stop();
      clearInterval(priceInterval);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivePrices();
    setRefreshing(false);
  };

  const handleActionPress = (actionId: string) => {
    // Add bounce animation
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    switch (actionId) {
      case 'buy':
        setModalType('buy');
        setModalVisible(true);
        break;
      case 'send':
        setModalType('send');
        setModalVisible(true);
        break;
      case 'swap':
        navigation.navigate('Swap' as never);
        break;
      case 'receive':
        setModalType('receive');
        setModalVisible(true);
        break;
      default:
        break;
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const WalletCard = () => (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={Colors.gradientAccent as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.walletCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Multi-Chain</Text>
            <Text style={styles.walletName}>Wallet 1</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$0.00</Text>
          <Text style={styles.balanceSubtext}>+$0.00 (0.00%) today</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => handleActionPress(action.id)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIcon}>
                {action.type === 'material' ? (
                  <MaterialCommunityIcons name={action.icon as any} size={22} color="white" />
                ) : (
                  <Ionicons name={action.icon as any} size={22} color="white" />
                )}
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
    </View>
  );

  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'tokens' && styles.activeTab]}
        onPress={() => setActiveTab('tokens')}
      >
        <Text style={[styles.tabText, activeTab === 'tokens' && styles.activeTabText]}>
          Tokens
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
        onPress={() => setActiveTab('upcoming')}
      >
        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
          Upcoming Tokens
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const TokenItem = ({ token }: { token: any }) => (
    <TouchableOpacity style={styles.tokenItemInner}>
      <View style={styles.tokenLeft}>
        <View style={styles.tokenIcon}>
          {token.type === 'image' ? (
            <Image 
              source={{ uri: token.imageUrl }} 
              style={styles.tokenImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.tokenEmoji}>{token.icon}</Text>
          )}
        </View>
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenName}>{token.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.tokenPrice}>{token.price}</Text>
            {token.change24h !== undefined && !isLoadingPrices && (
              <Text style={[
                styles.priceChange,
                { color: token.change24h >= 0 ? Colors.success : Colors.error }
              ]}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.tokenRight}>
        <Text style={styles.tokenBalance}>${token.value?.toLocaleString() || '0.00'}</Text>
        <Text style={styles.tokenAmount}>{token.balance} {token.symbol}</Text>
      </View>
    </TouchableOpacity>
  );

  const UpcomingTokenItem = ({ token }: { token: any }) => (
    <TouchableOpacity style={styles.tokenItemInner}>
      <View style={styles.tokenLeft}>
        <View style={[styles.tokenIcon, styles.upcomingIcon]}>
          {token.type === 'image' ? (
            <Image 
              source={{ uri: token.imageUrl }} 
              style={styles.tokenImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.tokenEmoji}>{token.icon}</Text>
          )}
        </View>
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenName}>{token.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.tokenPrice}>{token.price}</Text>
            {token.change24h !== undefined && !isLoadingPrices && (
              <Text style={[
                styles.priceChange,
                { color: token.change24h >= 0 ? Colors.success : Colors.error }
              ]}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.tokenRight}>
        <Text style={styles.upcomingLabel}>Available Now</Text>
        <Text style={styles.tokenAmount}>{token.launchDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Fixed Header with Wallet Card and Tabs */}
      <View style={styles.fixedHeader}>
        <WalletCard />
        <TabSelector />
      </View>
      
      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >        
        <View style={styles.tokensList}>
          {activeTab === 'tokens' ? (
            tokens.map((token, index) => (
              <TokenItem key={`token-${token.id}-${index}`} token={token} />
            ))
          ) : (
            upcomingTokens.map((token, index) => (
              <UpcomingTokenItem key={`upcoming-${token.id}-${index}`} token={token} />
            ))
          )}
        </View>
      </ScrollView>

      <ActionModals
        visible={modalVisible}
        type={modalType}
        onClose={closeModal}
        selectedToken={null}
        tokens={tokens.map(token => ({
          id: token.id,
          symbol: token.symbol,
          name: token.name,
          balance: parseFloat(token.balance.toString()) || 0,
          price: parseFloat(typeof token.price === 'string' ? token.price.replace(/[$,<>]/g, '') : '0') || 0,
          change24h: (token as any).change24h || 0,
          value: parseFloat(token.value.toString()) || 0,
          imageUrl: token.imageUrl,
        }))}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={Colors.brightBlue} />
          <Text style={[styles.navText, { color: Colors.brightBlue }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="trending-up" size={24} color={Colors.textSecondary} />
          <Text style={styles.navText}>Trade</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="gift" size={24} color={Colors.textSecondary} />
          <Text style={styles.navText}>Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="apps" size={24} color={Colors.textSecondary} />
          <Text style={styles.navText}>Apps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.notificationDot} />
          <Ionicons name="settings" size={24} color={Colors.textSecondary} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fixedHeader: {
    backgroundColor: Colors.background,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    paddingHorizontal: screenWidth > 400 ? 20 : 16,
    paddingTop: 50,
    paddingBottom: 24,
  },
  walletCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shadowPrimary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  walletName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  balanceSection: {
    marginBottom: 32,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    color: 'white',
    fontSize: screenWidth > 400 ? 36 : 32,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  balanceSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    marginRight: 16,
  },
  activeTab: {
    backgroundColor: Colors.brightBlue,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: 'white',
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  tokensList: {
    paddingHorizontal: 20,
  },

  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tokenEmoji: {
    fontSize: 24,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tokenPrice: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  tokenAmount: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  navText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    zIndex: 1,
  },

  tokenItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'transparent',
  },
  upcomingIcon: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  upcomingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 4,
  },
  tokenImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default EnhancedWalletScreen; 