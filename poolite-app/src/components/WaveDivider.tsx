import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// The signature element: a row of turquoise pills at alternating opacity,
// separating header from content on every screen.
const OPACITIES = [0.9, 0.3, 0.65, 0.3, 0.9, 0.3, 0.65, 0.3, 0.9];

export function WaveDivider({ style }: { style?: object }) {
  return (
    <View style={[styles.row, style]}>
      {OPACITIES.map((o, i) => (
        <View key={i} style={[styles.pill, { opacity: o }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  pill: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
