import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from '../PressableScale';
import { ProductImage } from '../ProductImage';
import { Product, formatEuro } from '../../data/products';
import { useCart } from '../../state/CartContext';
import { colors } from '../../theme/colors';

export function NeedNowCard({ product, why, urgent }: { product: Product; why: string; urgent: boolean }) {
  const cart = useCart();
  const inCart = !!cart.cart[product.id];

  return (
    <PressableScale
      haptic={false}
      scaleTo={0.99}
      onPress={() => router.push(`/(tabs)/shop/${product.id}`)}
      style={[styles.card, { borderColor: urgent ? colors.errorBorder : colors.border }]}
    >
      <View style={[styles.whyBox, { backgroundColor: urgent ? colors.errorBg : colors.selectedBg }]}>
        <Text style={[styles.whyText, { color: urgent ? colors.errorText : colors.primary }]}>{why}</Text>
      </View>
      <View style={styles.row}>
        <ProductImage productId={product.id} width={56} height={56} radius={14} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.badge}>{product.badge}</Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>{formatEuro(product.price)}</Text>
          {product.old && <Text style={styles.oldPrice}>{formatEuro(product.old)}</Text>}
        </View>
      </View>
      <PressableScale
        scaleTo={0.97}
        onPress={() => cart.add(product.id)}
        style={[styles.addBtn, { backgroundColor: inCart ? colors.selectedBg : colors.primary }]}
      >
        <Text style={[styles.addBtnText, { color: inCart ? colors.primary : '#FFFFFF' }]}>
          {inCart ? `Nel carrello ✓ · ${cart.cart[product.id]}` : 'Ordina con sconto Poolite'}
        </Text>
      </PressableScale>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0E5A6D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  whyBox: { borderRadius: 14, padding: 12 },
  whyText: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  name: { fontWeight: '800', fontSize: 16, color: colors.textPrimary },
  badge: { fontSize: 12, color: colors.accent, fontWeight: '700', marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '800', color: colors.primary },
  oldPrice: { fontSize: 13, color: colors.textSecondary, textDecorationLine: 'line-through' },
  addBtn: { marginTop: 12, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  addBtnText: { fontWeight: '800', fontSize: 15 },
});
