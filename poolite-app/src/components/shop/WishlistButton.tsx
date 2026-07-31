import { Text, StyleSheet, ViewStyle } from 'react-native';
import { PressableScale } from '../PressableScale';
import { colors } from '../../theme/colors';
import { useWishlist } from '../../state/WishlistContext';

/** The AliExpress heart: save now, buy later. */
export function WishlistButton({ productId, size = 34, style }: { productId: string; size?: number; style?: ViewStyle }) {
  const wishlist = useWishlist();
  const saved = wishlist.has(productId);
  return (
    <PressableScale
      scaleTo={0.85}
      onPress={() => wishlist.toggle(productId)}
      accessibilityLabel={saved ? 'Togli dai preferiti' : 'Aggiungi ai preferiti'}
      style={[
        styles.btn,
        { width: size, height: size, borderRadius: size / 2 },
        saved && { backgroundColor: colors.errorBg, borderColor: colors.errorBorder },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.45 }}>{saved ? '❤️' : '🤍'}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
