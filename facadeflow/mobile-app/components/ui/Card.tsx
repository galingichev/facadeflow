import React from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity, Platform, StyleProp } from 'react-native';
import { config } from '../../src/lib/config';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'small' | 'medium' | 'large';
  elevation?: boolean;
  border?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'medium',
  elevation = true,
  border = true,
  onPress,
}) => {
  const paddingMap = { none: 0, small: 14, medium: 18, large: 24 };
  const cardStyle = [
    styles.card,
    {
      padding: paddingMap[padding],
      backgroundColor: config.theme.surfaceSoft,
      ...(border && { borderWidth: 1, borderColor: config.theme.border }),
      ...(elevation && styles.elevation),
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} accessibilityRole="button" activeOpacity={0.86}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: Platform.OS === 'web' ? 0.18 : 0.32,
    shadowRadius: 36,
    elevation: 6,
  },
});
