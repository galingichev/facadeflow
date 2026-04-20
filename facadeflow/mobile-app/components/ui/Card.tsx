import React from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity, AccessibilityRole } from 'react-native';
import { config } from '../../src/lib/config';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
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
  border = false,
  onPress,
}) => {
  const paddingMap = {
    none: 0,
    small: 12,
    medium: 16,
    large: 24,
  };

  const cardStyle = [
    styles.card,
    {
      padding: paddingMap[padding],
      backgroundColor: config.theme.surface,
      ...(elevation && styles.elevation),
      ...(border && { borderWidth: 1, borderColor: config.theme.border }),
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
