import { Text, StyleSheet, ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'solid',
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'done';
  style?: ViewStyle;
}) {
  const done = variant === 'done';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        {
          backgroundColor: done ? colors.selectedBg : colors.primary,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: done ? colors.primary : '#FFFFFF' }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '800',
    fontSize: 16,
  },
});
