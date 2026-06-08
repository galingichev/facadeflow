import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { config } from '../../src/lib/config';
import { useI18n } from '../../src/i18n';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title, variant = 'primary', size = 'medium', loading = false, leftIcon, rightIcon, icon,
  fullWidth = false, style, textStyle, disabled, accessibilityLabel, ...rest
}) => {
  const { t } = useI18n();
  const background = disabled ? config.theme.secondary : getBackgroundColor(variant);
  const textColor = disabled ? config.theme.textMuted : getTextColor(variant);
  const sizeStyles = getSizeStyles(size);
  const translatedTitle = t(title);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: background, borderColor: getBorderColor(variant), borderWidth: variant === 'ghost' ? 0 : 1 },
        sizeStyles.button,
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.84}
      accessibilityLabel={accessibilityLabel || translatedTitle}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...rest}
    >
      {loading ? <ActivityIndicator color={textColor} size="small" /> : <>
        {icon && <View style={[styles.iconWrapper, { marginRight: 8 }]}><MaterialIcons name={icon as any} size={18} color={textColor} /></View>}
        {leftIcon && <View style={[styles.iconWrapper, { marginRight: 8 }]}>{leftIcon}</View>}
        <Text style={[styles.text, { color: textColor }, sizeStyles.text, textStyle]}>{translatedTitle}</Text>
        {rightIcon && <View style={[styles.iconWrapper, { marginLeft: 8 }]}>{rightIcon}</View>}
      </>}
    </TouchableOpacity>
  );
};

function getBackgroundColor(variant: ButtonVariant) {
  switch (variant) {
    case 'primary': return config.theme.primary;
    case 'secondary': return 'rgba(255,255,255,0.06)';
    case 'outline': return 'rgba(255,255,255,0.02)';
    case 'ghost': return 'transparent';
    case 'danger': return 'rgba(239,68,68,0.18)';
  }
}
function getTextColor(variant: ButtonVariant) {
  switch (variant) {
    case 'primary': return '#ffffff';
    case 'danger': return '#fca5a5';
    default: return config.theme.text;
  }
}
function getBorderColor(variant: ButtonVariant) {
  if (variant === 'primary') return 'rgba(255,255,255,0.14)';
  if (variant === 'danger') return 'rgba(239,68,68,0.35)';
  return config.theme.border;
}
function getSizeStyles(size: ButtonSize): { button: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'small': return { button: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 }, text: { fontSize: 13 } };
    case 'large': return { button: { paddingVertical: 15, paddingHorizontal: 22, minHeight: 52 }, text: { fontSize: 16 } };
    default: return { button: { paddingVertical: 11, paddingHorizontal: 16, minHeight: 44 }, text: { fontSize: 14 } };
  }
}

const styles = StyleSheet.create({
  button: { borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  text: { fontWeight: '700', textAlign: 'center', letterSpacing: 0.1 },
  fullWidth: { width: '100%' },
  iconWrapper: { justifyContent: 'center', alignItems: 'center' },
});
