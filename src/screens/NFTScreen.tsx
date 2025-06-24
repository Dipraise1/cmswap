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
import { Colors } from '../constants/Colors';
import AdvancedHeader from '../components/AdvancedHeader';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  price?: number;
  currency: string;
}

const NFTScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'owned' | 'activity'>('owned');
  
  const [nfts] = useState<NFT[]>([
    {
      id: '1',
      name: 'Solana Monkey #1234',
      collection: 'Solana Monkey Business',
      image: 'https://via.placeholder.com/300',
      price: 15.5,
      currency: 'SOL',
    },
    {
      id: '2',
      name: 'DeGods #5678',
      collection: 'DeGods',
      image: 'https://via.placeholder.com/300',
      price: 45.2,
      currency: 'SOL',
    },
    {
      id: '3',
      name: 'Okay Bears #9012',
      collection: 'Okay Bears',
      image: 'https://via.placeholder.com/300',
      price: 8.7,
      currency: 'SOL',
    },
    {
      id: '4',
      name: 'Famous Fox #3456',
      collection: 'Famous Fox Federation',
      image: 'https://via.placeholder.com/300',
      price: 12.3,
      currency: 'SOL',
    },
  ]);

  const renderNFT = ({ item }: { item: NFT }) => (
    <TouchableOpacity style={styles.nftItem}>
      <View style={styles.nftImageContainer}>
        <View style={styles.nftImagePlaceholder}>
          <Ionicons name="image" size={32} color={Colors.textSecondary} />
        </View>
      </View>
      <View style={styles.nftInfo}>
        <Text style={styles.nftName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.nftCollection} numberOfLines={1}>{item.collection}</Text>
        {item.price && (
          <Text style={styles.nftPrice}>{item.price} {item.currency}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AdvancedHeader
        title="NFTs"
        subtitle="Your Digital Collection"
        showNotification={false}
        onProfilePress={() => console.log('Profile pressed')}
      />

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
          <Ionicons name="time-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyStateText}>No recent activity</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scanButton: {
    padding: 8,
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
  },
  row: {
    justifyContent: 'space-between',
  },
  nftItem: {
    width: itemWidth,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  nftImageContainer: {
    width: '100%',
    height: itemWidth,
  },
  nftImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nftInfo: {
    padding: 12,
  },
  nftName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  nftCollection: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  nftPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});

export default NFTScreen; 