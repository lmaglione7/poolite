import { View, Text, StyleSheet } from 'react-native';
import { PressableScale } from '../PressableScale';
import { ProductImage } from '../ProductImage';
import { colors } from '../../theme/colors';

export function CategoryTile({
  label,
  image,
  active,
  onPress,
}: {
  label: string;
  image: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale scaleTo={0.95} onPress={onPress} style={[styles.wrap, { borderColor: active ? colors.accent : 'transparent' }]}>
      <ProductImage productId={image} width={200} height={76} radius={14} style={styles.img} />
      <View style={styles.gradient} pointerEvents="none" />
      <Text numberOfLines={2} style={styles.label}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  // Explicit basis (not flex:1) so 3 tiles wrap per row instead of 6 sharing one row.
  wrap: { width: '31.5%', flexGrow: 0, flexShrink: 0, height: 76, borderRadius: 16, overflow: 'hidden', borderWidth: 2 },
  img: { ...StyleSheet.absoluteFill, width: undefined, height: undefined },
  gradient: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14,90,109,0.35)' },
  label: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 5,
    textAlign: 'center',
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    lineHeight: 12,
  },
});
