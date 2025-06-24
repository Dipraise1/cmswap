import React, { useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { getTokenImageWithFallback } from '../utils/tokenImages';

interface TokenImageProps {
  symbol: string;
  size: number;
  borderRadius?: number;
  style?: any;
}

export const TokenImage: React.FC<TokenImageProps> = ({ 
  symbol, 
  size, 
  borderRadius = size / 2,
  style 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  
  const imageUrls = getTokenImageWithFallback(symbol);
  
  const getTokenIcon = (symbol: string): any => {
    const icons: { [key: string]: any } = {
      SOL: 'sunny',
      ETH: 'diamond',
      USDC: 'card',
      BTC: 'logo-bitcoin',
    };
    return icons[symbol] || 'ellipse';
  };

  const getTokenGradient = (symbol: string): string[] => {
    const gradients: { [key: string]: string[] } = {
      SOL: ['#FF6B6B', '#4ECDC4'],
      ETH: ['#627EEA', '#8A92DB'],
      USDC: ['#2775CA', '#759DEB'],
      BTC: ['#F7931A', '#FFB84D'],
    };
    return gradients[symbol] || [Colors.primary, Colors.accent];
  };

  const handleImageError = () => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setShowFallback(true);
    }
  };

  if (showFallback) {
    return (
      <LinearGradient
        colors={getTokenGradient(symbol)}
        style={[
          styles.fallbackContainer,
          {
            width: size,
            height: size,
            borderRadius,
          },
          style,
        ]}
      >
        <Ionicons 
          name={getTokenIcon(symbol)} 
          size={size * 0.5} 
          color={Colors.text} 
        />
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.imageContainer,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: imageUrls[currentImageIndex] }}
        style={{
          width: size,
          height: size,
          borderRadius,
        }}
        onError={handleImageError}
        onLoad={() => console.log(`Successfully loaded ${symbol} image from source ${currentImageIndex + 1}`)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
}); 