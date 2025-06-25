import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Modal,
  Image,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { responsive } from '../utils/responsive';

interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Message {
  id: string;
  sender: string;
  senderName: string;
  recipient: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'payment' | 'request' | 'image' | 'voice' | 'file' | 'nft';
  amount?: number;
  token?: string;
  status: 'sent' | 'delivered' | 'read';
  isOwn: boolean;
  reactions?: MessageReaction[];
  replyTo?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  isEdited?: boolean;
  nftData?: {
    name: string;
    image: string;
    collection: string;
  };
}

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  verified?: boolean;
  favorite?: boolean;
  ens?: string;
  notes?: string;
  addedDate: Date;
  lastContactDate?: Date;
  tags?: string[];
}

interface Chat {
  id: string;
  participantAddress: string;
  participantName: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  avatar: string;
  isGroup?: boolean;
  groupMembers?: string[];
  isTyping?: boolean;
  lastSeen?: Date;
  isPinned?: boolean;
  isMuted?: boolean;
}

const MessagesScreen: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'chats' | 'contacts'>('chats');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alex Thompson',
      address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      avatar: 'person',
      verified: true,
      favorite: true,
      ens: 'alex.sol',
      addedDate: new Date(Date.now() - 86400000 * 30),
      lastContactDate: new Date(),
      tags: ['Friend', 'DeFi'],
    },
    {
      id: '2',
      name: 'Sarah Martinez',
      address: '7xKWrzkxnyK7djGp8WcJgF5gNvP5VVQn2GxGVDtH8AeT',
      avatar: 'person-outline',
      verified: true,
      ens: 'sarah.crypto',
      addedDate: new Date(Date.now() - 86400000 * 15),
      lastContactDate: new Date(Date.now() - 3600000),
      tags: ['Work', 'NFT'],
    },
  ]);

  const [chats] = useState<Chat[]>([
    {
      id: '1',
      participantAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      participantName: 'Alex Thompson',
      lastMessage: 'Thanks for the payment! 🚀',
      timestamp: new Date(),
      unreadCount: 1,
      isOnline: true,
      avatar: 'person',
      isPinned: true,
      isTyping: false,
      lastSeen: new Date(Date.now() - 300000),
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      sender: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      senderName: 'Alex Thompson',
      recipient: 'you',
      content: 'Hey! Thanks for the payment! 🚀',
      timestamp: new Date(),
      type: 'text',
      status: 'read',
      isOwn: false,
      reactions: [
        { emoji: '🚀', users: ['you', 'Alex Thompson'], count: 2 }
      ],
    },
  ]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactAddress.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newContactAddress.length < 20) {
      Alert.alert('Error', 'Please enter a valid wallet address');
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      address: newContactAddress.trim(),
      avatar: 'person',
      verified: false,
      favorite: false,
      addedDate: new Date(),
      tags: [],
    };

    setContacts(prev => [newContact, ...prev]);
    setNewContactName('');
    setNewContactAddress('');
    setShowAddContact(false);
    Alert.alert('Success', 'Contact added successfully!');
  };

  const handleStartChat = (contact: Contact) => {
    const existingChat = chats.find(chat => chat.participantAddress === contact.address);
    if (existingChat) {
      setSelectedChat(existingChat.id);
    } else {
      Alert.alert('Chat', `Starting new conversation with ${contact.name}`);
    }
    setCurrentView('chats');
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message
      Alert.alert('Message Sent', `Message: "${messageText}" sent successfully!`);
      setMessageText('');
      setReplyingTo(null);
    }
  };

  const handleLongPressMessage = (message: Message) => {
    Alert.alert(
      'Message Options',
      'What would you like to do?',
      [
        { text: 'Reply', onPress: () => setReplyingTo(message) },
        { text: 'Copy', onPress: () => Alert.alert('Copied', 'Message copied to clipboard') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const clearReply = () => {
    setReplyingTo(null);
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[styles.chatItem, selectedChat === item.id && styles.selectedChatItem]}
      onPress={() => setSelectedChat(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name={item.avatar as any} size={24} color={Colors.brightBlue} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.participantName}>{item.participantName}</Text>
          <Text style={styles.chatTime}>{formatTime(item.timestamp)}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.walletAddress}>{formatAddress(item.participantAddress)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactCard}
      onPress={() => handleStartChat(item)}
      activeOpacity={0.7}
    >
      <View style={styles.contactHeader}>
        <View style={styles.contactAvatar}>
          <Ionicons name="person" size={20} color={Colors.text} />
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            </View>
          )}
        </View>
        
        <View style={styles.contactInfo}>
          <View style={styles.contactNameRow}>
            <Text style={styles.contactName}>{item.name}</Text>
            {item.favorite && <Ionicons name="heart" size={14} color={Colors.error} />}
          </View>
          {item.ens && <Text style={styles.ensName}>@{item.ens}</Text>}
          <Text style={styles.contactAddress}>{formatAddress(item.address)}</Text>
        </View>
        
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={18} color={Colors.brightBlue} />
        </TouchableOpacity>
      </View>
      
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (selectedChat) {
    const selectedMessage = messages.find(msg => replyingTo?.id === msg.id);

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedChat(null)}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatAvatar}>
                <Ionicons name="person" size={20} color={Colors.brightBlue} />
              </View>
              <View>
                <Text style={styles.chatHeaderName}>Alex Thompson</Text>
                <Text style={styles.chatHeaderStatus}>Online</Text>
              </View>
            </View>
          </View>
          
          <FlatList
            data={messages}
            renderItem={({ item }) => {
              const replyMessage = item.replyTo ? messages.find(m => m.id === item.replyTo) : null;
              
              return (
                <TouchableOpacity
                  style={[styles.messageContainer, item.isOwn && styles.ownMessage]}
                  onLongPress={() => handleLongPressMessage(item)}
                  activeOpacity={0.7}
                >
                  {/* Reply indicator */}
                  {replyMessage && (
                    <View style={[styles.replyContainer, item.isOwn && styles.ownReplyContainer]}>
                      <View style={styles.replyLine} />
                      <View style={styles.replyContent}>
                        <Text style={styles.replyName}>{replyMessage.senderName}</Text>
                        <Text style={styles.replyText} numberOfLines={1}>
                          {replyMessage.content}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View style={[styles.messageBubble, item.isOwn && styles.ownMessageBubble]}>
                    <Text style={[styles.messageText, item.isOwn && styles.ownMessageText]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.messageTime, item.isOwn && styles.ownMessageTime]}>
                      {formatTime(item.timestamp)}
                    </Text>
                  </View>

                  {/* Message reactions */}
                  {item.reactions && item.reactions.length > 0 && (
                    <View style={[styles.reactionsContainer, item.isOwn && styles.ownReactionsContainer]}>
                      {item.reactions.map((reaction, index) => (
                        <View key={index} style={styles.reactionBubble}>
                          <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                          <Text style={styles.reactionCount}>{reaction.count}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            inverted
          />
          
          <View style={styles.inputAreaContainer}>
            {/* Reply Preview */}
            {replyingTo && (
              <View style={styles.replyPreview}>
                <View style={styles.replyPreviewLine} />
                <View style={styles.replyPreviewContent}>
                  <Text style={styles.replyPreviewName}>
                    Replying to {replyingTo.senderName}
                  </Text>
                  <Text style={styles.replyPreviewText} numberOfLines={1}>
                    {replyingTo.content}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.replyCloseButton}
                  onPress={clearReply}
                >
                  <Ionicons name="close" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textSecondary}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Professional Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddContact(true)}
        >
          <Ionicons name="person-add" size={22} color={Colors.brightBlue} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, currentView === 'chats' && styles.activeTab]}
          onPress={() => setCurrentView('chats')}
        >
          <Text style={[styles.tabText, currentView === 'chats' && styles.activeTabText]}>
            Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentView === 'contacts' && styles.activeTab]}
          onPress={() => setCurrentView('contacts')}
        >
          <Text style={[styles.tabText, currentView === 'contacts' && styles.activeTabText]}>
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={currentView === 'chats' ? "Search conversations..." : "Search contacts..."}
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      {currentView === 'chats' ? (
        <FlatList
          data={chats.filter(chat => 
            chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={contacts.filter(contact => 
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.address.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <TouchableOpacity 
              style={styles.addContactHeader}
              onPress={() => setShowAddContact(true)}
            >
              <View style={styles.addContactIcon}>
                <Ionicons name="person-add" size={20} color={Colors.brightBlue} />
              </View>
              <Text style={styles.addContactText}>Add New Contact</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add Contact Modal */}
      <Modal
        visible={showAddContact}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddContact(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contact</Text>
              <TouchableOpacity 
                onPress={() => setShowAddContact(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter contact name"
                  placeholderTextColor={Colors.textSecondary}
                  value={newContactName}
                  onChangeText={setNewContactName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wallet Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter wallet address or ENS"
                  placeholderTextColor={Colors.textSecondary}
                  value={newContactAddress}
                  onChangeText={setNewContactAddress}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddContact(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAddContact}
                >
                  <Text style={styles.saveButtonText}>Add Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  addButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.brightBlue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.text,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedChatItem: {
    backgroundColor: Colors.brightBlue + '20',
    borderWidth: 1,
    borderColor: Colors.brightBlue,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: Colors.success,
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  ownMessageBubble: {
    backgroundColor: Colors.brightBlue,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  ownMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ownMessageTime: {
    color: Colors.text + '80',
  },
  inputAreaContainer: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brightBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyContainer: {
    marginBottom: 4,
    marginLeft: 16,
    marginRight: 16,
  },
  ownReplyContainer: {
    alignSelf: 'flex-end',
    marginLeft: 60,
  },
  replyLine: {
    width: 3,
    height: '100%',
    backgroundColor: Colors.brightBlue,
    position: 'absolute',
    left: 0,
    borderRadius: 2,
  },
  replyContent: {
    marginLeft: 12,
    paddingVertical: 4,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brightBlue,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  replyPreviewLine: {
    width: 3,
    height: 30,
    backgroundColor: Colors.brightBlue,
    borderRadius: 2,
    marginRight: 12,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brightBlue,
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  replyCloseButton: {
    padding: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 16,
  },
  ownReactionsContainer: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginLeft: 60,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  addContactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.brightBlue,
    borderStyle: 'dashed',
  },
  addContactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brightBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addContactText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brightBlue,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.brightBlue,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.brightBlue,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  walletAddress: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: 'monospace',
  },
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 8,
  },
  ensName: {
    fontSize: 12,
    color: Colors.brightBlue,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  messageButton: {
    padding: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default MessagesScreen; 