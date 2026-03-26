import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { config } from '../../src/config';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: 'small' | 'medium' | 'large' | number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  uri,
  size = 'medium',
  style,
  textStyle,
}) => {
  const getSize = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 56;
      case 'medium':
      default:
        return 44;
    }
  };

  const avatarSize = getSize();
  const fontSize = Math.round(avatarSize * 0.4);
  const initials = getInitials(name);
  const backgroundColor = stringToColor(name);
  const accessibilityLabel = `Avatar for ${name}`;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
          style,
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      <Text
        style={[
          styles.initials,
          { fontSize, color: '#fff' },
          textStyle,
        ]}
        accessibilityLabel={undefined} // Already set on container
      >
        {initials}
      </Text>
    </View>
  );
};

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function stringToColor(str: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e',
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '600',
  },
});
