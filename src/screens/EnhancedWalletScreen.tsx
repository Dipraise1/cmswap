import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { FloatingLogo } from '../components/FloatingLogo';
import { ActionModals } from '../components/ActionModals';
import { TokenImage } from '../components/TokenImage';
import { priceService, PortfolioToken } from '../services/PriceService';
import { responsive, scale, moderateScale, getResponsiveValue } from '../utils/responsive';

export const EnhancedWalletScreen: React.FC = () => {
  const [totalBalance, setTotalBalance] = useState(12847.63);
  const [selectedToken, setSelectedToken] = useState<PortfolioToken | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'send' | 'receive' | 'buy' | 'stake' | 'swap'>('send');
  const [portfolioTokens, setPortfolioTokens] = useState<PortfolioToken[]>([]);
  const [priceUpdateTimer, setPriceUpdateTimer] = useState<NodeJS.Timeout | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [screenData, setScreenData] = useState(responsive.getDimensions());
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Token gradient function moved inside component
  const getTokenGradient = (symbol: string): string[] => {
    const gradients: { [key: string]: string[] } = {
      SOL: ['#FF6B6B', '#4ECDC4'],
      ETH: ['#627EEA', '#8A92DB'],
      USDC: ['#2775CA', '#759DEB'],
      BTC: ['#F7931A', '#FFB84D'],
    };
    return gradients[symbol] || [Colors.primary, Colors.accent];
  };

  // Token icon function moved inside component
  const getTokenIcon = (symbol: string): any => {
    const icons: { [key: string]: any } = {
      SOL: 'sunny',
      ETH: 'diamond',
      USDC: 'card',
      BTC: 'logo-bitcoin',
    };
    return icons[symbol] || 'ellipse';
  };

  // Responsive action buttons configuration
  const getActionButtons = () => {
    const buttonLayout = responsive.getActionButtonLayout();
    
    return [
      { 
        title: 'Send', 
        icon: 'send', 
        colors: [Colors.primary, Colors.accent],
        action: () => openActionModal('send')
      },
      { 
        title: 'Receive', 
        icon: 'download', 
        colors: [Colors.accent, Colors.primaryLight],
        action: () => openActionModal('receive')
      },
      { 
        title: 'Buy', 
        icon: 'card', 
        colors: [Colors.success, '#00A844'],
        action: () => openActionModal('buy')
      },
      { 
        title: 'Stake', 
        icon: 'trending-up', 
        colors: [Colors.warning, '#FF6B35'],
        action: () => openActionModal('stake')
      },
      { 
        title: 'Swap', 
        icon: 'swap-horizontal', 
        colors: [Colors.primaryLight, Colors.accent],
        action: () => openActionModal('swap')
      },
    ];
  };

  // Responsive dimensions listener
  useEffect(() => {
    const unsubscribe = responsive.subscribe((dimensions) => {
      setScreenData(dimensions);
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    const startAnimations = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.02,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimations();
  }, []);

  useEffect(() => {
    initializePortfolio();
    startPriceUpdates();

    return () => {
      if (priceUpdateTimer) {
        clearInterval(priceUpdateTimer);
      }
    };
  }, []);

  const initializePortfolio = async () => {
    const mockPortfolio = [
      { symbol: 'SOL', balance: 12.5847 },
      { symbol: 'ETH', balance: 0.8923 },
      { symbol: 'USDC', balance: 2547.32 },
      { symbol: 'BTC', balance: 0.0234 },
    ];

    try {
      const portfolioData = await priceService.getPortfolioData(mockPortfolio);
      setPortfolioTokens(portfolioData);
      
      const total = portfolioData.reduce((sum, token) => sum + token.value, 0);
      setTotalBalance(total);
    } catch (error) {
      console.error('Error initializing portfolio:', error);
    }
  };

  const startPriceUpdates = () => {
    const cleanup = priceService.startPriceUpdates(
      (prices) => {
        setPortfolioTokens(prevTokens => {
          const updatedPortfolio = prevTokens.map(token => {
            const priceData = prices.find(p => p.symbol.toLowerCase() === token.symbol.toLowerCase());
            if (priceData) {
              return {
                ...token,
                price: priceData.current_price,
                change24h: priceData.price_change_percentage_24h,
                value: token.balance * priceData.current_price,
              };
            }
            return token;
          });
          
          const total = updatedPortfolio.reduce((sum, token) => sum + token.value, 0);
          setTotalBalance(total);
          
          return updatedPortfolio;
        });
      },
      ['SOL', 'ETH', 'USDC', 'BTC'],
      45000 // Update every 45 seconds to avoid rate limits
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializePortfolio();
    setRefreshing(false);
  };

  const openActionModal = (type: 'send' | 'receive' | 'buy' | 'stake' | 'swap', token?: PortfolioToken) => {
    setModalType(type);
    setSelectedToken(token || portfolioTokens[0]);
    setModalVisible(true);
  };

  const closeActionModal = () => {
    setModalVisible(false);
    setSelectedToken(null);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Get responsive styles
  const padding = responsive.getPadding();
  const cardSize = responsive.getCardSize();
  const actionButtonLayout = responsive.getActionButtonLayout();
  const tokenListLayout = responsive.getTokenListLayout();
  const isTablet = responsive.shouldUseTabletLayout();

  // Render action button
  const renderActionButton = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      style={[
        styles.actionItem,
        {
          width: (screenData.width - padding.horizontal * 2 - actionButtonLayout.spacing * (actionButtonLayout.itemsPerRow - 1)) / actionButtonLayout.itemsPerRow,
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50 * (index + 1), 0],
            })},
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={item.action} activeOpacity={0.8}>
        <LinearGradient
          colors={item.colors}
          style={[styles.actionButton, { 
            width: actionButtonLayout.buttonSize, 
            height: actionButtonLayout.buttonSize,
            borderRadius: actionButtonLayout.buttonSize / 2,
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons 
            name={item.icon as any} 
            size={responsive.getIconSize(24)} 
            color={Colors.text} 
          />
        </LinearGradient>
        <Text style={[styles.actionTitle, { fontSize: responsive.getFontSize(12) }]}>
          {item.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render token item
  const renderTokenItem = ({ item, index }: { item: PortfolioToken; index: number }) => (
    <Animated.View
      style={[
        styles.tokenItem,
        {
          marginBottom: cardSize.margin,
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100 * (index + 1), 0],
            })},
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={[styles.tokenContent, {
          borderRadius: cardSize.borderRadius,
          padding: cardSize.padding,
        }]}
        onPress={() => setSelectedToken(item)}
        activeOpacity={0.8}
      >
        <TokenImage
          symbol={item.symbol}
          size={responsive.getIconSize(48)}
          borderRadius={responsive.getIconSize(24)}
          style={{ marginRight: 16 }}
        />
        
        <View style={styles.tokenInfo}>
          <View style={styles.tokenRow}>
            <Text style={[styles.tokenSymbol, { fontSize: responsive.getFontSize(18) }]}>
              {item.symbol}
            </Text>
            <Text style={[styles.tokenBalance, { fontSize: responsive.getFontSize(16) }]}>
              {item.balance.toFixed(4)}
            </Text>
          </View>
          <View style={styles.tokenRow}>
            <Text style={[styles.tokenName, { fontSize: responsive.getFontSize(14) }]}>
              {item.name}
            </Text>
            <Text style={[styles.tokenValue, { fontSize: responsive.getFontSize(14) }]}>
              ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        
        <View style={styles.tokenStats}>
          <Text style={[
            styles.tokenChange,
            { 
              color: item.change24h >= 0 ? Colors.success : Colors.error,
              fontSize: responsive.getFontSize(14),
            }
          ]}>
            {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
          </Text>
          <Text style={[styles.tokenPrice, { fontSize: responsive.getFontSize(12) }]}>
            ${item.price.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            progressBackgroundColor={Colors.surface}
          />
        }
        contentContainerStyle={{ maxWidth: responsive.getMaxWidth(), alignSelf: 'center', width: '100%' }}
      >
        {/* Balance Card */}
        <Animated.View
          style={[
            styles.balanceCard,
            {
              marginHorizontal: padding.horizontal,
              marginVertical: padding.vertical,
              borderRadius: cardSize.borderRadius,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })},
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent, Colors.primaryLight]}
            style={[styles.balanceGradient, { borderRadius: cardSize.borderRadius }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={30} style={[styles.balanceBlur, { padding: cardSize.padding }]}>
              <View style={styles.balanceHeader}>
                <View style={styles.balanceLeft}>
                  <Text style={[styles.balanceLabel, { fontSize: responsive.getFontSize(16) }]}>
                    Total Portfolio Value
                  </Text>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Text style={[styles.balanceAmount, { fontSize: responsive.getFontSize(isTablet ? 36 : 32) }]}>
                      {isBalanceVisible ? `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
                    </Text>
                  </Animated.View>
                  <View style={styles.balanceChange}>
                    <Ionicons name="trending-up" size={responsive.getIconSize(16)} color={Colors.success} />
                    <Text style={[styles.changeText, { fontSize: responsive.getFontSize(14) }]}>
                      +$247.83 (2.1%) today
                    </Text>
                  </View>
                </View>
                
                <View style={styles.balanceRight}>
                  <TouchableOpacity 
                    style={[styles.visibilityButton, { padding: responsive.getSpacing(8) }]}
                    onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                  >
                    <Ionicons 
                      name={isBalanceVisible ? "eye" : "eye-off"} 
                      size={responsive.getIconSize(20)} 
                      color={Colors.text} 
                    />
                  </TouchableOpacity>
                  
                  <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <FloatingLogo size={responsive.getIconSize(50)} />
                  </Animated.View>
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              paddingHorizontal: padding.horizontal,
              marginBottom: padding.large,
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })},
              ],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { 
            fontSize: responsive.getFontSize(20),
            marginBottom: padding.medium,
          }]}>
            Quick Actions
          </Text>
          
          <FlatList
            data={getActionButtons()}
            renderItem={renderActionButton}
            numColumns={actionButtonLayout.itemsPerRow}
            key={`actions-${actionButtonLayout.itemsPerRow}`}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.actionsGrid}
            columnWrapperStyle={actionButtonLayout.itemsPerRow > 1 ? { justifyContent: 'space-between' } : undefined}
          />
        </Animated.View>

        {/* Portfolio Section */}
        <Animated.View
          style={[
            styles.portfolioSection,
            {
              paddingHorizontal: padding.horizontal,
              marginBottom: padding.large,
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [75, 0],
                })},
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontSize: responsive.getFontSize(20) }]}>
              Portfolio
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { fontSize: responsive.getFontSize(14) }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={portfolioTokens}
            renderItem={renderTokenItem}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            numColumns={tokenListLayout.showGrid ? tokenListLayout.columns : 1}
            key={`tokens-${tokenListLayout.columns}`}
            columnWrapperStyle={tokenListLayout.showGrid && tokenListLayout.columns > 1 ? { justifyContent: 'space-between' } : undefined}
          />
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View
          style={[
            styles.activitySection,
            {
              paddingHorizontal: padding.horizontal,
              paddingBottom: padding.large,
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                })},
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontSize: responsive.getFontSize(20) }]}>
              Recent Activity
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { fontSize: responsive.getFontSize(14) }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityList}>
            {[
              { type: 'received', amount: '+2.5 SOL', usd: '+$612.50', time: '2h ago' },
              { type: 'sent', amount: '-0.1 ETH', usd: '-$384.21', time: '1d ago' },
              { type: 'swap', amount: '100 USDC → 0.4 SOL', usd: '$100.00', time: '3d ago' },
            ].map((activity, index) => (
              <View key={index} style={[styles.activityItem, {
                borderRadius: cardSize.borderRadius,
                padding: cardSize.padding,
                marginBottom: cardSize.margin,
              }]}>
                <LinearGradient
                  colors={
                    activity.type === 'received' ? [Colors.success, '#00A844'] :
                    activity.type === 'sent' ? [Colors.error, '#FF4757'] :
                    [Colors.warning, '#FF6B35']
                  }
                  style={[styles.activityIcon, {
                    width: responsive.getIconSize(40),
                    height: responsive.getIconSize(40),
                    borderRadius: responsive.getIconSize(20),
                  }]}
                >
                  <Ionicons
                    name={
                      activity.type === 'received' ? 'arrow-down' :
                      activity.type === 'sent' ? 'arrow-up' :
                      'swap-horizontal'
                    }
                    size={responsive.getIconSize(20)}
                    color={Colors.text}
                  />
                </LinearGradient>
                
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityAmount, { fontSize: responsive.getFontSize(16) }]}>
                    {activity.amount}
                  </Text>
                  <Text style={[styles.activityTime, { fontSize: responsive.getFontSize(12) }]}>
                    {activity.time}
                  </Text>
                </View>
                
                <Text style={[styles.activityUsd, { fontSize: responsive.getFontSize(14) }]}>
                  {activity.usd}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Modals */}
      <ActionModals
        visible={modalVisible}
        type={modalType}
        onClose={closeActionModal}
        selectedToken={selectedToken}
        tokens={portfolioTokens}
      />
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
  balanceCard: {
    elevation: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  balanceGradient: {
    overflow: 'hidden',
  },
  balanceBlur: {
    // padding handled by responsive system
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeText: {
    color: Colors.success,
    fontWeight: '600',
  },
  balanceRight: {
    alignItems: 'center',
    gap: 12,
  },
  visibilityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  actionsContainer: {
    // padding handled by responsive system
  },
  sectionTitle: {
    fontWeight: '700',
    color: Colors.text,
  },
  actionsGrid: {
    // flexDirection and justifyContent handled by FlatList
  },
  actionItem: {
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionTitle: {
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  portfolioSection: {
    // padding handled by responsive system
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tokenItem: {
    flex: 1,
  },
  tokenContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tokenIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tokenImageContainer: {
    position: 'relative',
    marginRight: 16,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tokenImage: {
    backgroundColor: Colors.surface,
  },
  tokenIconFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenSymbol: {
    fontWeight: '700',
    color: Colors.text,
  },
  tokenBalance: {
    fontWeight: '600',
    color: Colors.text,
  },
  tokenName: {
    color: Colors.textSecondary,
  },
  tokenValue: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tokenStats: {
    alignItems: 'flex-end',
  },
  tokenChange: {
    fontWeight: '700',
    marginBottom: 4,
  },
  tokenPrice: {
    color: Colors.textSecondary,
  },
  activitySection: {
    // padding handled by responsive system
  },
  activityList: {
    // gap handled by marginBottom in items
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  activityIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityAmount: {
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    color: Colors.textSecondary,
  },
  activityUsd: {
    fontWeight: '600',
    color: Colors.text,
  },
});

export default EnhancedWalletScreen; 