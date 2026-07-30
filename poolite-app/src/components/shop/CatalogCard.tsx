import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from '../PressableScale';
import { ProductImage } from '../ProductImage';
import { Product, formatEuro, pctOff, starString } from '../../data/products';
import { useCart } from '../../state/CartContext';
import { colors } from '../../theme/colors';

export function CatalogCard({ product }: { product: Product }) {
  const cart = useCart();

  return (
    <PressableScale scaleTo={0.98} onPress={() => router.push(`/(tabs)/shop/${product.id}`)} style={styles.card}>
      <View style={styles.imageWrap}>
        <ProductImage productId={product.id} width={200} height={78} radius={14} style={{ width: '100%' }} />
        {product.old && (
          <View style={styles.pctBadge}>
            <Text style={styles.pctText}>{pctOff(product)}</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>
      <Text numberOfLines={1} style={styles.badge}>
        {product.badge}
      </Text>
      <Text style={styles.rating}>
        {starString(product.rating)} <Text style={styles.ratingNum}>{product.rating.toFixed(1).replace('.', ',')}/5</Text>
      </Text>
      <View style={styles.bottomRow}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatEuro(product.price)}</Text>
          {product.old && <Text style={styles.oldPrice}>{formatEuro(product.old)}</Text>}
        </View>
        <PressableScale scaleTo={0.9} onPress={() => cart.add(product.id)} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </PressableScale>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
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
  imageWrap: { height: 78, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  pctBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.amberBg, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  pctText: { color: colors.amber, fontSize: 11, fontWeight: '800' },
  name: { fontWeight: '700', fontSize: 13, color: colors.textPrimary, marginTop: 8, lineHeight: 17, minHeight: 34 },
  badge: { fontSize: 11, color: colors.accent, fontWeight: '700', marginTop: 2 },
  rating: { fontSize: 11, color: colors.accent, marginTop: 3 },
  ratingNum: { color: colors.textSecondary, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  priceRow: { flexDirection: 'row', gap: 5, alignItems: 'baseline' },
  price: { fontWeight: '800', fontSize: 15, color: colors.primary },
  oldPrice: { fontSize: 11, color: colors.textSecondary, textDecorationLine: 'line-through' },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
});
