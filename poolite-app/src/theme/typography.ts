import { Platform } from 'react-native';

// System font everywhere — SF Pro on iOS. Decisive weights: 800 for the big euro
// numbers, which are the hero of every screen (must read from 2 meters away).
export const fontFamily = Platform.select({
  ios: '-apple-system',
  android: 'sans-serif',
  default: 'system-ui',
});

export const weight = {
  regular: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};
