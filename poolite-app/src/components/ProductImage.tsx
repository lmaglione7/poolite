import { View, StyleSheet, ViewStyle } from 'react-native';
import { PRODUCT_IMAGES } from '../data/productImages';
import { colors } from '../theme/colors';

// Each prod-*.svg is a full 200x200 flat illustration with its own background
// fill (like a photo would have) — render it edge-to-edge with "cover"
// cropping (preserveAspectRatio="slice"), matching the prototype's
// background-size:cover usage exactly.
export function ProductImage({
  productId,
  width,
  height = width,
  radius = 14,
  style,
}: {
  productId: string;
  width: number;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const Svg = PRODUCT_IMAGES[productId];
  return (
    <View style={[styles.wrap, { width, height, borderRadius: radius }, style]}>
      {Svg && <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.selectedBg,
    overflow: 'hidden',
  },
});
