import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { config } from '../../src/lib/config';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  trackColor?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = config.theme.primary,
  trackColor = config.theme.border,
  height = 8,
  animated = true,
  showLabel = false,
  label,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);

  return (
    <View
      style={style}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      accessibilityLabel={label || `${percentage} percent complete`}
    >
      {showLabel && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: trackColor,
            borderRadius: height / 2,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              height,
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = config.theme.primary,
  label,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 48;
      case 'medium':
      default:
        return 32;
    }
  };

  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size={getSize()} color={color} />
      {label && <Text style={styles.spinnerLabel}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: config.theme.text,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: config.theme.textSecondary,
    fontWeight: '600',
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    // Animated width via Animated API if needed
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  spinnerLabel: {
    marginTop: 8,
    fontSize: 14,
    color: config.theme.textSecondary,
  },
});
