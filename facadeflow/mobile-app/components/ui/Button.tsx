import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { config } from '../../src/lib/config';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: string; // MaterialIcons name
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  accessibilityLabel,
  ...rest
}) => {
  const getBackgroundColor = () => {
    if (disabled) return config.theme.border;
    switch (variant) {
      case 'primary':
        return config.theme.primary;
      case 'secondary':
        return config.theme.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return config.theme.error;
      default:
        return config.theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return config.theme.textSecondary;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#ffffff';
      case 'outline':
      case 'ghost':
        return config.theme.primary;
      default:
        return '#ffffff';
    }
  };

  const getBorderColor = () => {
    if (disabled) return config.theme.border;
    if (variant === 'outline') return config.theme.primary;
    return 'transparent';
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          button: { paddingVertical: 8, paddingHorizontal: 12, height: 36 },
          text: { fontSize: 14 },
        };
      case 'medium':
        return {
          button: { paddingVertical: 12, paddingHorizontal: 16, height: 44 },
          text: { fontSize: 16 },
        };
      case 'large':
        return {
          button: { paddingVertical: 16, paddingHorizontal: 24, height: 52 },
          text: { fontSize: 18 },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const a11yLabel = accessibilityLabel || title;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        sizeStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityLabel={a11yLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <View style={[styles.iconWrapper, { marginRight: 8 }]}>{leftIcon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, sizeStyles.text, textStyle]}>
            {title}
          </Text>
          {rightIcon && <View style={[styles.iconWrapper, { marginLeft: 8 }]}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconWrapper: {
    // Wrapper to provide margin around icons
    justifyContent: 'center',
    alignItems: 'center',
  },
});
