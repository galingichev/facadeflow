import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { config } from '../../src/lib/config';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  helper?: string;
  indeterminate?: boolean;
  color?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  error,
  helper,
  indeterminate = false,
  color = config.theme.primary,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => !disabled && onCheckedChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled, busy: indeterminate }}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[
          styles.checkbox,
          {
            borderColor: disabled
              ? config.theme.border
              : error
              ? config.theme.error
              : checked || indeterminate
              ? color
              : config.theme.border,
            backgroundColor: checked || indeterminate ? color : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {indeterminate ? (
          <Text style={styles.indicator}>−</Text>
        ) : checked ? (
          <Text style={styles.indicator}>✓</Text>
        ) : null}
      </TouchableOpacity>

      {label && (
        <Text
          style={[
            styles.label,
            disabled && styles.labelDisabled,
            error && styles.labelError,
          ]}
          onPress={() => !disabled && onCheckedChange(!checked)}
        >
          {label}
        </Text>
      )}

      {(error || helper) && (
        <Text style={[styles.helper, error && styles.error]}>{error || helper}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  indicator: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: config.theme.text,
    lineHeight: 20,
  },
  labelDisabled: {
    color: config.theme.textSecondary,
  },
  labelError: {
    color: config.theme.error,
  },
  helper: {
    fontSize: 12,
    color: config.theme.textSecondary,
    marginTop: 2,
  },
  error: {
    color: config.theme.error,
  },
});
