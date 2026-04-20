import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { config } from '../../src/lib/config';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  dot?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  count,
  maxCount = 99,
  showZero = false,
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return config.theme.primary;
      case 'success':
        return config.theme.success;
      case 'warning':
        return config.theme.warning;
      case 'error':
        return config.theme.error;
      case 'default':
      default:
        return config.theme.secondary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return dot
          ? { height: 8, minWidth: 8 }
          : { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10, height: 18 };
      case 'large':
        return dot
          ? { height: 10, minWidth: 10 }
          : { paddingHorizontal: 10, paddingVertical: 4, fontSize: 14, height: 24 };
      case 'medium':
      default:
        return dot
          ? { height: 9, minWidth: 9 }
          : { paddingHorizontal: 8, paddingVertical: 3, fontSize: 12, height: 20 };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderBadgeContent = () => {
    if (dot) {
      return <View style={[styles.dot, { backgroundColor: getBackgroundColor() }]} accessibilityLabel="Notification indicator" />;
    }

    if (count !== undefined) {
      if (count === 0 && !showZero) return null;
      const displayCount = count > maxCount ? `${maxCount}+` : count;
      return (
        <View
          style={[styles.badge, sizeStyles, { backgroundColor: getBackgroundColor() }]}
          accessibilityLabel={`${count} items`}
          accessibilityRole="text"
        >
          <Text style={[styles.text, { fontSize: sizeStyles.fontSize, color: '#fff' }]}>
            {displayCount}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.badge, sizeStyles, { backgroundColor: getBackgroundColor() }]}>
        <Text style={[styles.text, { fontSize: sizeStyles.fontSize, color: '#fff' }]}>
          {children}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {children}
      {renderBadgeContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    minWidth: 18,
    zIndex: 1,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
});
