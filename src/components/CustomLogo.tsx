import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface CustomLogoProps {
  size?: number;
  style?: any;
}

export const CustomLogo: React.FC<CustomLogoProps> = ({ size = 60, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require('../../c5bd744e-de62-48d6-bc88-db9c6ba613cc.jpeg')}
        style={[styles.logo, { width: size, height: size }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 12,
  },
}); 