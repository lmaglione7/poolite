import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type Props = ViewProps & {
  tone?: 'default' | 'amber' | 'error' | 'selected' | 'primary';
  soft?: boolean; // lighter shadow, used for tightly stacked cards
};

const TONES = {
  default: { bg: colors.card, border: colors.border },
  amber: { bg: colors.card, border: colors.amberBorder },
  error: { bg: colors.errorBg, border: colors.errorBorder },
  selected: { bg: colors.selectedBg, border: colors.selectedBorder },
  primary: { bg: colors.primary, border: colors.primary },
};

export function Card({ tone = 'default', soft, style, children, ...rest }: Props) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: t.bg, borderColor: t.border, shadowOpacity: soft ? 0.05 : 0.08 },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0E5A6D',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 2,
  },
});
