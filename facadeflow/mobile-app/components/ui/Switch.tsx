import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { config } from '../../src/lib/config';

interface SwitchProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  helper?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  value,
  onValueChange,
  disabled = false,
  helper,
  color = config.theme.primary,
  size = 'medium',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          trackWidth: 44,
          trackHeight: 26,
          thumbSize: 22,
          padding: 2,
        };
      case 'large':
        return {
          trackWidth: 60,
          trackHeight: 34,
          thumbSize: 30,
          padding: 2,
        };
      case 'medium':
      default:
        return {
          trackWidth: 52,
          trackHeight: 30,
          thumbSize: 26,
          padding: 2,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const thumbTranslateX = value ? sizeStyles.trackWidth - sizeStyles.thumbSize - sizeStyles.padding * 2 : 0;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
          <TouchableOpacity
            onPress={() => !disabled && onValueChange(!value)}
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            style={[
              styles.track,
              {
                width: sizeStyles.trackWidth,
                height: sizeStyles.trackHeight,
                borderRadius: sizeStyles.trackHeight / 2,
                backgroundColor: value ? color : config.theme.border,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.thumb,
                {
                  width: sizeStyles.thumbSize,
                  height: sizeStyles.thumbSize,
                  borderRadius: sizeStyles.thumbSize / 2,
                  transform: [{ translateX: thumbTranslateX }],
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      )}
      {!label && (
        <TouchableOpacity
          onPress={() => !disabled && onValueChange(!value)}
          accessibilityRole="switch"
          accessibilityState={{ checked: value, disabled }}
          style={[
            styles.track,
            {
              width: sizeStyles.trackWidth,
              height: sizeStyles.trackHeight,
              borderRadius: sizeStyles.trackHeight / 2,
              backgroundColor: value ? color : config.theme.border,
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.thumb,
              {
                width: sizeStyles.thumbSize,
                height: sizeStyles.thumbSize,
                borderRadius: sizeStyles.thumbSize / 2,
                transform: [{ translateX: thumbTranslateX }],
              },
            ]}
          />
        </TouchableOpacity>
      )}
      {helper && <Text style={styles.helper}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: config.theme.text,
    flex: 1,
    marginRight: 12,
  },
  labelDisabled: {
    color: config.theme.textSecondary,
  },
  track: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 2,
  },
  thumb: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  helper: {
    fontSize: 12,
    color: config.theme.textSecondary,
    marginTop: 4,
  },
});
