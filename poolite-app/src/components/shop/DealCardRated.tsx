import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from '../PressableScale';
import { ProductImage } from '../ProductImage';
import { Product, formatEuro, pctOff, starString } from '../../data/products';
import { useCart } from '../../state/CartContext';
import { colors } from '../../theme/colors';

// "SCOPRI LE OFFERTE" card in the Shop tab: bigger image, star rating, and its
// own quick add-to-cart pill.
export function DealCardRated({ product }: { product: Product }) {
  const cart = useCart();
  const inCart = !!cart.cart[product.id];

  return (
    <View style={styles.card}>
      <PressableScale scaleTo={0.98} onPress={() => router.push(`/(tabs)/shop/${product.id}`)}>
        <View style={styles.imageWrap}>
          <ProductImage productId={product.id} width={128} height={88} radius={14} style={{ width: '100%' }} />
          <View style={styles.pctBadge}>
            <Text style={styles.pctText}>{pctOff(product)}</Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
      </PressableScale>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatEuro(product.price)}</Text>
        {product.old && <Text style={styles.oldPrice}>{formatEuro(product.old)}</Text>}
      </View>
      <Text style={styles.rating}>
        {starString(product.rating)} <Text style={styles.ratingNum}>{product.rating.toFixed(1).replace('.', ',')}/5</Text>
      </Text>
      <PressableScale scaleTo={0.95} haptic onPress={() => cart.add(product.id)} style={[styles.addBtn, { backgroundColor: inCart ? colors.selectedBg : colors.card }]}>
        <Text style={styles.addBtnText}>{inCart ? `NEL CARRELLO ✓ · ${cart.cart[product.id]}` : 'AGGIUNGI AL CARRELLO'}</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 152,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 12,
    shadowColor: '#0E5A6D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  imageWrap: { height: 88, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  pctBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.amberBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  pctText: { color: colors.amber, fontSize: 11, fontWeight: '800' },
  name: { fontWeight: '700', fontSize: 13, color: colors.textPrimary, marginTop: 8, lineHeight: 17, minHeight: 34 },
  priceRow: { flexDirection: 'row', gap: 5, alignItems: 'baseline', marginTop: 2 },
  price: { fontWeight: '800', fontSize: 15, color: colors.primary },
  oldPrice: { fontSize: 11, color: colors.textSecondary, textDecorationLine: 'line-through' },
  rating: { fontSize: 11, color: colors.accent, marginTop: 2 },
  ratingNum: { color: colors.textSecondary, fontWeight: '700' },
  addBtn: { marginTop: 8, borderRadius: 999, borderWidth: 1.5, borderColor: colors.primary, paddingVertical: 7, alignItems: 'center' },
  addBtnText: { color: colors.primary, fontWeight: '800', fontSize: 10, letterSpacing: 0.3 },
});
