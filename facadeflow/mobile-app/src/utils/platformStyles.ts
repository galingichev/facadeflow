import { Platform, type ViewStyle } from 'react-native';

type ShadowOptions = {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  radius?: number;
  elevation?: number;
};

const clampOpacity = (opacity: number) => Math.max(0, Math.min(1, opacity));

const hexToRgba = (color: string, opacity: number) => {
  const hex = color.replace('#', '');
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) {
    return color;
  }

  const fullHex = hex.length === 3
    ? hex.split('').map((char) => char + char).join('')
    : hex;
  const value = Number.parseInt(fullHex, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `rgba(${red}, ${green}, ${blue}, ${clampOpacity(opacity)})`;
};

export const platformShadow = ({
  color = '#000',
  offsetX = 0,
  offsetY = 2,
  opacity = 0.2,
  radius = 4,
  elevation = 2,
}: ShadowOptions): ViewStyle => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${hexToRgba(color, opacity)}`,
    } as ViewStyle;
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};
