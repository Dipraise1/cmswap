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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { responsive } from '../utils/responsive';

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
  duration?: number; // for voice messages
  isEdited?: boolean;
  nftData?: {
    name: string;
    image: string;
    collection: string;
  };
}

interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const recordingAnim = useRef(new Animated.Value(0)).current;
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const [chats] = useState<Chat[]>([
    {
      id: '1',
      participantAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      participantName: 'Alex.sol',
      lastMessage: 'Thanks for the payment! 🚀',
      timestamp: new Date(),
      unreadCount: 2,
      isOnline: true,
      avatar: 'person',
      isPinned: true,
      isTyping: false,
      lastSeen: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      participantAddress: '7xKWrzkxnyK7djGp8WcJgF5gNvP5VVQn2GxGVDtH8AeT',
      participantName: 'Sarah.crypto',
      lastMessage: 'Can you send me 5 SOL?',
      timestamp: new Date(Date.now() - 3600000),
      unreadCount: 0,
      isOnline: false,
      avatar: 'person-outline',
      lastSeen: new Date(Date.now() - 1800000),
    },
    {
      id: '3',
      participantAddress: '3KfVpP8FkqP9QxGf8UoKjQgFv8UoKjQgFv8UoKjQgFv8',
      participantName: 'DeFi Traders',
      lastMessage: 'John: New NFT drop tomorrow! 🎨',
      timestamp: new Date(Date.now() - 7200000),
      unreadCount: 5,
      isOnline: true,
      avatar: 'people',
      isGroup: true,
      groupMembers: ['John.eth', 'Emma.sol', 'David.crypto'],
    },
    {
      id: '4',
      participantAddress: '4MfVpP8FkqP9QxGf8UoKjQgFv8UoKjQgFv8UoKjQgFv9',
      participantName: 'Emma.nft',
      lastMessage: '🎵 Voice message',
      timestamp: new Date(Date.now() - 10800000),
      unreadCount: 0,
      isOnline: true,
      avatar: 'person',
      isTyping: true,
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      sender: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      senderName: 'Alex.sol',
      recipient: 'you',
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 7200000),
      type: 'text',
      status: 'read',
      isOwn: false,
      reactions: [
        { emoji: '👍', users: ['you'], count: 1 },
        { emoji: '❤️', users: ['Alex.sol'], count: 1 }
      ],
    },
    {
      id: '2',
      sender: 'you',
      senderName: 'You',
      recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      content: 'Good! Just sent you some SOL',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'delivered',
      isOwn: true,
      replyTo: '1',
    },
    {
      id: '3',
      sender: 'you',
      senderName: 'You',
      recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      content: 'Payment sent',
      timestamp: new Date(Date.now() - 3500000),
      type: 'payment',
      amount: 2.5,
      token: 'SOL',
      status: 'delivered',
      isOwn: true,
    },
    {
      id: '4',
      sender: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      senderName: 'Alex.sol',
      recipient: 'you',
      content: 'Thanks for the payment! 🚀',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      status: 'sent',
      isOwn: false,
      reactions: [
        { emoji: '🚀', users: ['you', 'Alex.sol'], count: 2 }
      ],
    },
    {
      id: '5',
      sender: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      senderName: 'Alex.sol',
      recipient: 'you',
      content: '',
      timestamp: new Date(Date.now() - 1200000),
      type: 'voice',
      status: 'delivered',
      isOwn: false,
      duration: 15,
      fileUrl: 'voice_message.mp3',
    },
    {
      id: '6',
      sender: 'you',
      senderName: 'You',
      recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      content: '',
      timestamp: new Date(Date.now() - 600000),
      type: 'nft',
      status: 'delivered',
      isOwn: true,
      nftData: {
        name: 'Cool Ape #1234',
        image: 'https://example.com/nft.jpg',
        collection: 'Bored Apes'
      },
    },
    {
      id: '7',
      sender: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      senderName: 'Alex.sol',
      recipient: 'you',
      content: 'Wow! That NFT is amazing! 🎨✨',
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
      isOwn: false,
      replyTo: '6',
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

  // Enhanced messaging functions
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      recordingAnim.setValue(0);
    }
  }, [isRecording]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      Alert.alert('Message Sent', `Message: "${messageText}" sent successfully!`);
      setMessageText('');
      setReplyingTo(null);
      setIsTyping(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);
    setIsTyping(true);
    
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSendPayment = () => {
    setShowPaymentModal(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closePaymentModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPaymentModal(false);
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    Alert.alert('Reaction Added', `Added ${emoji} to message`);
    setShowReactionModal(false);
    setSelectedMessage(null);
  };

  const handleLongPress = (message: Message) => {
    setSelectedMessage(message.id);
    setShowReactionModal(true);
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setShowReactionModal(false);
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      Alert.alert('Voice Message', 'Voice message recorded and sent!');
    } else {
      setIsRecording(true);
    }
  };

  const handleAttachment = (type: string) => {
    setShowAttachmentMenu(false);
    switch (type) {
      case 'image':
        Alert.alert('Image', 'Image picker would open here');
        break;
      case 'file':
        Alert.alert('File', 'File picker would open here');
        break;
      case 'nft':
        Alert.alert('NFT', 'NFT selector would open here');
        break;
      case 'location':
        Alert.alert('Location', 'Location picker would open here');
        break;
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={[styles.chatItem, selectedChat === item.id && styles.selectedChatItem]}
      onPress={() => setSelectedChat(item.id)}
    >
      {item.isPinned && <View style={styles.pinnedIndicator} />}
      
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, item.isGroup && styles.groupAvatar]}>
          <Ionicons name={item.avatar as any} size={24} color={Colors.primary} />
          {item.isGroup && (
            <View style={styles.groupBadge}>
              <Ionicons name="people" size={12} color={Colors.text} />
            </View>
          )}
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.participantName}>{item.participantName}</Text>
            {item.isMuted && (
              <Ionicons name="volume-mute" size={16} color={Colors.textSecondary} style={styles.mutedIcon} />
            )}
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.chatTime}>{formatTime(item.timestamp)}</Text>
            {item.isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>typing...</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          <View style={styles.chatBadges}>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.walletAddress}>{formatAddress(item.participantAddress)}</Text>
          {item.isGroup && (
            <Text style={styles.groupMembers}>
              {item.groupMembers?.length} members
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const replyMessage = item.replyTo ? messages.find(m => m.id === item.replyTo) : null;
    
    return (
      <Pressable
        style={[styles.messageContainer, item.isOwn && styles.ownMessageContainer]}
        onLongPress={() => handleLongPress(item)}
      >
        {/* Reply indicator */}
        {replyMessage && (
          <View style={[styles.replyContainer, item.isOwn && styles.ownReplyContainer]}>
            <View style={styles.replyLine} />
            <View style={styles.replyContent}>
              <Text style={styles.replyName}>{replyMessage.senderName}</Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {replyMessage.type === 'payment' ? `💰 ${replyMessage.amount} ${replyMessage.token}` :
                 replyMessage.type === 'voice' ? '🎵 Voice message' :
                 replyMessage.type === 'nft' ? '🎨 NFT' :
                 replyMessage.content}
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.messageBubble, item.isOwn ? styles.ownMessage : styles.otherMessage]}>
          {item.type === 'payment' ? (
            <View style={styles.paymentMessage}>
              <LinearGradient
                colors={[Colors.success, Colors.accent]}
                style={styles.paymentHeader}
              >
                <Ionicons name={item.isOwn ? "arrow-up" : "arrow-down"} size={16} color={Colors.text} />
                <Text style={styles.paymentLabel}>
                  {item.isOwn ? 'Payment Sent' : 'Payment Received'}
                </Text>
              </LinearGradient>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentAmount}>{item.amount} {item.token}</Text>
                <Text style={styles.paymentTime}>{formatTime(item.timestamp)}</Text>
              </View>
            </View>
          ) : item.type === 'voice' ? (
            <View style={styles.voiceMessage}>
              <TouchableOpacity style={styles.voicePlayButton}>
                <Ionicons name="play" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <View style={styles.voiceWaveform}>
                {[...Array(12)].map((_, i) => (
                  <View key={i} style={[styles.waveBar, { height: Math.random() * 20 + 10 }]} />
                ))}
              </View>
              <Text style={styles.voiceDuration}>{item.duration}s</Text>
            </View>
          ) : item.type === 'nft' ? (
            <View style={styles.nftMessage}>
              <View style={styles.nftImageContainer}>
                <View style={styles.nftImagePlaceholder}>
                  <Ionicons name="image" size={40} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.nftDetails}>
                <Text style={styles.nftName}>{item.nftData?.name}</Text>
                <Text style={styles.nftCollection}>{item.nftData?.collection}</Text>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.messageText, item.isOwn ? styles.ownMessageText : styles.otherMessageText]}>
                {item.content}
                {item.isEdited && <Text style={styles.editedIndicator}> (edited)</Text>}
              </Text>
              <Text style={[styles.messageTime, item.isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
                {formatTime(item.timestamp)}
              </Text>
            </>
          )}
        </View>

        {/* Message reactions */}
        {item.reactions && item.reactions.length > 0 && (
          <View style={[styles.reactionsContainer, item.isOwn && styles.ownReactionsContainer]}>
            {item.reactions.map((reaction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionBubble}
                onPress={() => handleReaction(item.id, reaction.emoji)}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={styles.reactionCount}>{reaction.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {item.isOwn && (
          <View style={styles.messageStatus}>
            <Ionicons
              name={
                item.status === 'read' ? 'checkmark-done' :
                item.status === 'delivered' ? 'checkmark' : 'time'
              }
              size={12}
              color={item.status === 'read' ? Colors.primary : Colors.textSecondary}
            />
          </View>
        )}
      </Pressable>
    );
  };

  if (selectedChat) {
    const currentChat = chats.find(chat => chat.id === selectedChat);
    const chatMessages = messages.filter(msg => 
      msg.sender === currentChat?.participantAddress || 
      msg.recipient === currentChat?.participantAddress
    );

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <BlurView intensity={100} style={styles.chatHeaderBlur}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedChat(null)}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            
            <View style={styles.chatHeaderInfo}>
              <View style={styles.chatAvatar}>
                <Ionicons name={currentChat?.avatar as any} size={20} color={Colors.primary} />
                {currentChat?.isOnline && <View style={styles.headerOnlineIndicator} />}
              </View>
              <View>
                <Text style={styles.chatHeaderName}>{currentChat?.participantName}</Text>
                <Text style={styles.chatHeaderAddress}>
                  {formatAddress(currentChat?.participantAddress || '')}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.chatMenuButton}>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
            </TouchableOpacity>
          </BlurView>

          <FlatList
            data={chatMessages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            showsVerticalScrollIndicator={false}
            inverted
          />

          <BlurView intensity={100} style={styles.inputContainer}>
            {/* Reply preview */}
            {replyingTo && (
              <View style={styles.replyPreview}>
                <View style={styles.replyPreviewLine} />
                <View style={styles.replyPreviewContent}>
                  <Text style={styles.replyPreviewName}>Replying to {replyingTo.senderName}</Text>
                  <Text style={styles.replyPreviewText} numberOfLines={1}>
                    {replyingTo.type === 'payment' ? `💰 ${replyingTo.amount} ${replyingTo.token}` :
                     replyingTo.type === 'voice' ? '🎵 Voice message' :
                     replyingTo.type === 'nft' ? '🎨 NFT' :
                     replyingTo.content}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.replyCloseButton}
                  onPress={() => setReplyingTo(null)}
                >
                  <Ionicons name="close" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={styles.attachButton}
                onPress={() => setShowAttachmentMenu(true)}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.attachButtonGradient}
                >
                  <Ionicons name="add" size={18} color={Colors.text} />
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a message..."
                  placeholderTextColor={Colors.textSecondary}
                  value={messageText}
                  onChangeText={handleTyping}
                  multiline
                />
              </View>
              
              {messageText.trim() ? (
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                >
                  <LinearGradient
                    colors={[Colors.accent, Colors.accentDark]}
                    style={styles.sendButtonGradient}
                  >
                    <Ionicons name="send" size={18} color={Colors.text} />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.voiceButton}
                  onPress={handleVoiceRecord}
                  onLongPress={handleVoiceRecord}
                >
                  <Animated.View style={[
                    styles.voiceButtonGradient,
                    {
                      opacity: recordingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.6],
                      }),
                    }
                  ]}>
                    <LinearGradient
                      colors={isRecording ? [Colors.error, '#FF6B6B'] : [Colors.success, Colors.accent]}
                      style={styles.voiceButtonGradient}
                    >
                      <Ionicons 
                        name={isRecording ? "stop" : "mic"} 
                        size={18} 
                        color={Colors.text} 
                      />
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              )}
            </View>

            {/* Recording indicator */}
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <Animated.View style={[
                  styles.recordingDot,
                  {
                    opacity: recordingAnim,
                  }
                ]} />
                <Text style={styles.recordingText}>Recording voice message...</Text>
              </View>
            )}
          </BlurView>
        </KeyboardAvoidingView>

        {/* Enhanced Modals */}
        {showPaymentModal && (
          <Animated.View 
            style={[
              styles.paymentModal,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0],
                  }),
                }],
              },
            ]}
          >
            <BlurView intensity={100} style={styles.paymentModalContent}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={closePaymentModal}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle}>Send Payment</Text>
              <Text style={styles.modalSubtitle}>To: {currentChat?.participantName}</Text>
              
              <View style={styles.paymentForm}>
                <Text style={styles.formLabel}>Amount</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="decimal-pad"
                />
                
                <Text style={styles.formLabel}>Token</Text>
                <TouchableOpacity style={styles.tokenSelector}>
                  <Text style={styles.tokenSelectorText}>SOL</Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.sendPaymentButton}>
                  <LinearGradient
                    colors={[Colors.success, Colors.accent]}
                    style={styles.sendPaymentButtonGradient}
                  >
                    <Text style={styles.sendPaymentButtonText}>Send Payment</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* Reaction Modal */}
        <Modal
          visible={showReactionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowReactionModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowReactionModal(false)}
          >
            <View style={styles.reactionModal}>
              <BlurView intensity={100} style={styles.reactionModalContent}>
                <Text style={styles.reactionModalTitle}>React to message</Text>
                
                <View style={styles.emojiGrid}>
                  {['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉', '💯'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.emojiButton}
                      onPress={() => handleReaction(selectedMessage || '', emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.messageActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      const message = messages.find(m => m.id === selectedMessage);
                      if (message) handleReply(message);
                    }}
                  >
                    <Ionicons name="arrow-undo" size={20} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Reply</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="copy" size={20} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Copy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share" size={20} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Forward</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </Pressable>
        </Modal>

        {/* Attachment Menu */}
        <Modal
          visible={showAttachmentMenu}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAttachmentMenu(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowAttachmentMenu(false)}
          >
            <View style={styles.attachmentModal}>
              <BlurView intensity={100} style={styles.attachmentModalContent}>
                <Text style={styles.attachmentModalTitle}>Send attachment</Text>
                
                <View style={styles.attachmentGrid}>
                  <TouchableOpacity 
                    style={styles.attachmentOption}
                    onPress={() => handleAttachment('image')}
                  >
                    <LinearGradient
                      colors={[Colors.primary, Colors.accent]}
                      style={styles.attachmentIcon}
                    >
                      <Ionicons name="image" size={24} color={Colors.text} />
                    </LinearGradient>
                    <Text style={styles.attachmentLabel}>Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.attachmentOption}
                    onPress={() => handleSendPayment()}
                  >
                    <LinearGradient
                      colors={[Colors.success, Colors.accent]}
                      style={styles.attachmentIcon}
                    >
                      <Ionicons name="card" size={24} color={Colors.text} />
                    </LinearGradient>
                    <Text style={styles.attachmentLabel}>Payment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.attachmentOption}
                    onPress={() => handleAttachment('nft')}
                  >
                    <LinearGradient
                      colors={[Colors.accent, Colors.primaryLight]}
                      style={styles.attachmentIcon}
                    >
                      <Ionicons name="diamond" size={24} color={Colors.text} />
                    </LinearGradient>
                    <Text style={styles.attachmentLabel}>NFT</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.attachmentOption}
                    onPress={() => handleAttachment('file')}
                  >
                    <LinearGradient
                      colors={[Colors.warning, '#FF8C00']}
                      style={styles.attachmentIcon}
                    >
                      <Ionicons name="document" size={24} color={Colors.text} />
                    </LinearGradient>
                    <Text style={styles.attachmentLabel}>File</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.attachmentOption}
                    onPress={() => handleAttachment('location')}
                  >
                    <LinearGradient
                      colors={[Colors.error, '#FF6B6B']}
                      style={styles.attachmentIcon}
                    >
                      <Ionicons name="location" size={24} color={Colors.text} />
                    </LinearGradient>
                    <Text style={styles.attachmentLabel}>Location</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.newChatButtonGradient}
          >
            <Ionicons name="add" size={24} color={Colors.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations or wallet address..."
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatsList}
        showsVerticalScrollIndicator={false}
      />
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
  newChatButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  newChatButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  selectedChatItem: {
    backgroundColor: Colors.surface,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
    backgroundColor: Colors.primary,
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
  pinnedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: Colors.primary,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  groupAvatar: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  groupBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mutedIcon: {
    marginLeft: 6,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  typingIndicator: {
    marginTop: 2,
  },
  typingText: {
    fontSize: 10,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  chatBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupMembers: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeaderBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  headerOnlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  chatHeaderAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  chatMenuButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageContainer: {
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ownMessage: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.text,
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  ownMessageTime: {
    color: Colors.text,
  },
  otherMessageTime: {
    color: Colors.textSecondary,
  },
  messageStatus: {
    marginTop: 4,
    marginRight: 8,
  },
  paymentMessage: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 6,
  },
  paymentDetails: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  paymentTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    marginRight: 12,
  },
  attachButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 12,
    minHeight: 40,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    color: Colors.text,
    maxHeight: 100,
  },
  sendButton: {},
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  paymentModalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  paymentForm: {
    flex: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  tokenSelector: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  tokenSelectorText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  sendPaymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendPaymentButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendPaymentButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  // Enhanced message styles
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
    backgroundColor: Colors.primary,
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
    color: Colors.primary,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: 200,
  },
  voicePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voiceWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    marginRight: 12,
  },
  waveBar: {
    width: 3,
    backgroundColor: Colors.primary,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  nftMessage: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nftImageContainer: {
    height: 150,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nftImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nftDetails: {
    padding: 12,
    backgroundColor: Colors.surface,
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
  },
  editedIndicator: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: 'italic',
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
  // Input area enhancements
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  replyPreviewLine: {
    width: 3,
    height: 30,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginRight: 12,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  replyCloseButton: {
    padding: 8,
  },
  voiceButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  voiceButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionModal: {
    width: '85%',
    maxWidth: 400,
  },
  reactionModalContent: {
    borderRadius: 20,
    padding: 24,
  },
  reactionModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  emojiText: {
    fontSize: 24,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  attachmentModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  attachmentModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  attachmentModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  attachmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    margin: 10,
  },
  attachmentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
});

export default MessagesScreen; 