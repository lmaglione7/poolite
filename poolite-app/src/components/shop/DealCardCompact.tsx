import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from '../PressableScale';
import { ProductImage } from '../ProductImage';
import { Product, formatEuro, pctOff } from '../../data/products';
import { colors } from '../../theme/colors';

// The "Offerte del giorno" horizontal carousel card, used on the Oggi tab.
export function DealCardCompact({ product }: { product: Product }) {
  return (
    <PressableScale scaleTo={0.97} onPress={() => router.push(`/(tabs)/shop/${product.id}`)} style={styles.card}>
      <View style={styles.topRow}>
        <ProductImage productId={product.id} width={46} height={46} radius={12} />
        <View style={styles.pctBadge}>
          <Text style={styles.pctText}>{pctOff(product)}</Text>
        </View>
      </View>
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatEuro(product.price)}</Text>
        {product.old && <Text style={styles.oldPrice}>{formatEuro(product.old)}</Text>}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 138,
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pctBadge: { backgroundColor: colors.amberBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  pctText: { color: colors.amber, fontSize: 11, fontWeight: '800' },
  name: { fontWeight: '700', fontSize: 13, color: colors.textPrimary, marginTop: 8, lineHeight: 17, minHeight: 34 },
  priceRow: { flexDirection: 'row', gap: 5, alignItems: 'baseline', marginTop: 4 },
  price: { fontWeight: '800', fontSize: 15, color: colors.primary },
  oldPrice: { fontSize: 11, color: colors.textSecondary, textDecorationLine: 'line-through' },
});
