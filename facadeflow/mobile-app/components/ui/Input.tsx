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
import { useI18n } from '../../src/i18n';

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
    const { t } = useI18n();
    const inputId = React.useId();
    const hasError = Boolean(error);
    const hasHelper = Boolean(helper);
    const labelId = label ? `${inputId}-label` : undefined;
    const descriptionId = hasError || hasHelper ? `${inputId}-description` : undefined;
    const translatedLabel = label ? t(label) : undefined;
    const translatedError = error ? t(error) : undefined;
    const translatedHelper = helper ? t(helper) : undefined;
    const translatedPlaceholder = typeof rest.placeholder === 'string' ? t(rest.placeholder) : rest.placeholder;

    // Build accessibility label from label + error/helper
    const a11yLabel = React.useMemo(() => {
      const parts: string[] = [];
      if (translatedLabel) parts.push(translatedLabel);
      if (translatedError) parts.push(`${t('Error')}: ${translatedError}`);
      else if (translatedHelper) parts.push(translatedHelper);
      return parts.join('. ');
    }, [t, translatedLabel, translatedError, translatedHelper]);

    return (
      <View style={[styles.container, containerStyle]}>
        {translatedLabel && <Text nativeID={labelId} style={styles.label}>{translatedLabel}</Text>}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: hasError ? config.theme.error : config.theme.border,
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
            aria-labelledby={labelId}
            aria-describedby={descriptionId}
            accessibilityRole="text"
            accessibilityState={{ disabled: rest.editable === false }}
            {...rest}
            placeholder={translatedPlaceholder}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {hasError ? <Text nativeID={descriptionId} style={styles.error}>{translatedError}</Text> : null}
        {hasHelper && !hasError ? <Text nativeID={descriptionId} style={styles.helper}>{translatedHelper}</Text> : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

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
