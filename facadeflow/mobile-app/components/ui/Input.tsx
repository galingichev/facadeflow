import React, { forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { config } from '../../src/lib/config';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helper, containerStyle, inputStyle, leftIcon, rightIcon, ...rest }, ref) => {
    // Build accessibility label from label + error/helper
    const a11yLabel = React.useMemo(() => {
      const parts: string[] = [];
      if (label) parts.push(label);
      if (error) parts.push(`Error: ${error}`);
      else if (helper) parts.push(helper);
      return parts.join('. ');
    }, [label, error, helper]);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: error ? config.theme.error : config.theme.border,
              backgroundColor: config.theme.background,
            },
          ]}
        >
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: config.theme.text },
              { paddingLeft: leftIcon ? 8 : 12 },
              { paddingRight: rightIcon ? 8 : 12 },
              inputStyle,
            ]}
            placeholderTextColor={config.theme.textSecondary}
            accessibilityLabel={a11yLabel}
            accessibilityRole="text"
            accessibilityState={{ disabled: rest.editable === false }}
            {...rest}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        {helper && !error && <Text style={styles.helper}>{helper}</Text>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: config.theme.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  iconLeft: {
    paddingLeft: 12,
  },
  iconRight: {
    paddingRight: 12,
  },
  error: {
    fontSize: 12,
    color: config.theme.error,
    marginTop: 4,
  },
  helper: {
    fontSize: 12,
    color: config.theme.textSecondary,
    marginTop: 4,
  },
});
