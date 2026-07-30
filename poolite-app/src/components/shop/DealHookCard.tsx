import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from '../PressableScale';
import { ProductImage } from '../ProductImage';
import { Product, formatEuro, pctOff } from '../../data/products';
import { colors } from '../../theme/colors';

// The amber-bordered cross-tab "deal hook" row used on Domani and Acqua —
// ties a specific offer to the advice just given on that screen.
export function DealHookCard({ product, label }: { product: Product; label: string }) {
  return (
    <PressableScale scaleTo={0.98} onPress={() => router.push(`/(tabs)/shop/${product.id}`)} style={styles.card}>
      <ProductImage productId={product.id} imageUrl={product.imageUrl} width={52} height={52} radius={14} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label} numberOfLines={1}>
          {label} {pctOff(product)}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatEuro(product.price)}</Text>
          {product.old && <Text style={styles.oldPrice}>{formatEuro(product.old)}</Text>}
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#E8A13C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: { fontSize: 12, fontWeight: '800', color: colors.amber },
  name: { fontWeight: '700', fontSize: 14, color: colors.textPrimary, marginTop: 2 },
  priceRow: { flexDirection: 'row', gap: 6, alignItems: 'baseline', marginTop: 2 },
  price: { fontWeight: '800', fontSize: 15, color: colors.primary },
  oldPrice: { fontSize: 12, color: colors.textSecondary, textDecorationLine: 'line-through' },
  chevron: { color: colors.accent, fontWeight: '800', fontSize: 18 },
});
