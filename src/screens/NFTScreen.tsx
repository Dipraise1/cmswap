import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import AdvancedHeader from '../components/AdvancedHeader';
import { responsive } from '../utils/responsive';

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  price?: number;
  currency: string;
  rarity?: string;
  floorPrice?: number;
}

const NFTScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'owned' | 'activity'>('owned');
  
  const [nfts] = useState<NFT[]>([
    {
      id: '1',
      name: 'Bored Ape #8817',
      collection: 'Bored Ape Yacht Club',
      image: 'https://i.seadn.io/gae/5E36AiH3mUH5KB5ue4vNRX9SkpPWL6KOL_8DzM0NCBJIFYgDjdE6QYZKwFgGwxO2BvYC5i_Oqq9GVgUBqe3Ux_QQgQm8C6FGR4q6vQ?auto=format&dpr=1&w=384',
      price: 89.5,
      currency: 'ETH',
      rarity: 'Legendary',
      floorPrice: 85.2,
    },
  ]);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Legendary': return '#FFD700';
      case 'Ultra Rare': return '#FF6B6B';
      case 'Epic': return '#9B59B6';
      case 'Rare': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  const renderNFT = ({ item }: { item: NFT }) => (
    <TouchableOpacity style={styles.nftItem}>
      <View style={styles.nftImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.nftImage}
          resizeMode="cover"
        />
        {item.rarity && (
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
            <Text style={styles.rarityText}>{item.rarity}</Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        />
      </View>
      <BlurView intensity={20} style={styles.nftInfo}>
        <Text style={styles.nftName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.nftCollection} numberOfLines={1}>{item.collection}</Text>
        <View style={styles.priceContainer}>
          {item.price && (
            <Text style={styles.nftPrice}>{item.price} {item.currency}</Text>
          )}
          {item.floorPrice && (
            <Text style={styles.floorPrice}>Floor: {item.floorPrice} {item.currency}</Text>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AdvancedHeader
        title="NFTs"
        subtitle="Your Digital Collection"
        showNotification={false}
        onProfilePress={() => {}}
      />

      <View style={styles.statsContainer}>
        <BlurView intensity={20} style={styles.statCard}>
          <Text style={styles.statValue}>{nfts.length}</Text>
          <Text style={styles.statLabel}>Owned</Text>
        </BlurView>
        <BlurView intensity={20} style={styles.statCard}>
          <Text style={styles.statValue}>
            {new Set(nfts.map(nft => nft.collection)).size}
          </Text>
          <Text style={styles.statLabel}>Collections</Text>
        </BlurView>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'owned' && styles.activeTab]}
          onPress={() => setSelectedTab('owned')}
        >
          <Text style={[styles.tabText, selectedTab === 'owned' && styles.activeTabText]}>
            Owned ({nfts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'activity' && styles.activeTab]}
          onPress={() => setSelectedTab('activity')}
        >
          <Text style={[styles.tabText, selectedTab === 'activity' && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'owned' ? (
        <FlatList
          data={nfts}
          renderItem={renderNFT}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.nftList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <LinearGradient
            colors={[Colors.primary + '20', Colors.accent + '20']}
            style={styles.emptyStateIcon}
          >
            <Ionicons name="time-outline" size={48} color={Colors.primary} />
          </LinearGradient>
          <Text style={styles.emptyStateText}>No recent activity</Text>
          <Text style={styles.emptyStateSubtext}>Your NFT transactions will appear here</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface + '80',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.text,
  },
  nftList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  nftItem: {
    width: (responsive.getDimensions().width - responsive.getPadding().horizontal * 2 - responsive.getSpacing(12)) / responsive.getGridColumns(),
    backgroundColor: Colors.surface,
    borderRadius: responsive.getCardSize().borderRadius,
    marginBottom: responsive.getSpacing(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: responsive.getSpacing(4) },
    shadowOpacity: 0.1,
    shadowRadius: responsive.getSpacing(8),
  },
  nftImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  nftImage: {
    width: '100%',
    height: '100%',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  nftInfo: {
    padding: 12,
    backgroundColor: Colors.surface + '90',
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  nftCollection: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  priceContainer: {
    gap: 2,
  },
  nftPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  floorPrice: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NFTScreen; 