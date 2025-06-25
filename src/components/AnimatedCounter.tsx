import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, TextStyle } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatNumber?: boolean;
  animateOnMount?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  style,
  prefix = '',
  suffix = '',
  decimals = 2,
  formatNumber = true,
  animateOnMount = true,
}) => {
  const animatedValue = useRef(new Animated.Value(animateOnMount ? 0 : value)).current;
  const [displayValue, setDisplayValue] = useState(animateOnMount ? 0 : value);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value: animValue }) => {
      setDisplayValue(animValue);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration]);

  const formatValue = (num: number): string => {
    const fixedNum = num.toFixed(decimals);
    
    if (formatNumber) {
      const parts = fixedNum.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    
    return fixedNum;
  };

  return (
    <Text style={style}>
      {`${prefix}${formatValue(displayValue)}${suffix}`}
    </Text>
  );
}; 