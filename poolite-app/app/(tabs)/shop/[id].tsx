import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../../../src/components/PressableScale';
import { ProductImage } from '../../../src/components/ProductImage';
import { CartButton } from '../../../src/components/shop/CartButton';
import { colors } from '../../../src/theme/colors';
import { useCatalog } from '../../../src/hooks/useCatalog';
import { useCart } from '../../../src/state/CartContext';
import { formatEuro, pctOff, starString } from '../../../src/data/products';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId } = useCatalog();
  const cart = useCart();
  const product = byId[id ?? ''];

  if (!product) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.textSecondary }}>Prodotto non trovato.</Text>
      </SafeAreaView>
    );
  }

  const inCart = !!cart.cart[product.id];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <CartButton />
        </View>

        <View style={styles.heroWrap}>
          <ProductImage productId={product.id} width={400} height={200} radius={24} style={{ width: '100%' }} />
          {product.old && (
            <View style={styles.pctBadge}>
              <Text style={styles.pctText}>{pctOff(product)}</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 4, paddingTop: 16 }}>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
            <Text style={styles.ratingText}>
              <Text style={{ color: colors.accent }}>{starString(product.rating)}</Text> {product.rating.toFixed(1).replace('.', ',')}/5
            </Text>
          </View>
          <Text style={styles.desc}>{product.desc}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatEuro(product.price)}</Text>
            {product.old && (
              <>
                <Text style={styles.oldPrice}>{formatEuro(product.old)}</Text>
                <Text style={styles.onlyWith}>solo con Poolite</Text>
              </>
            )}
          </View>

          <PressableScale
            onPress={() => cart.add(product.id)}
            style={[styles.addBtn, { backgroundColor: inCart ? colors.selectedBg : colors.primary }]}
          >
            <Text style={[styles.addBtnText, { color: inCart ? colors.primary : '#FFFFFF' }]}>
              {inCart ? `Nel carrello ✓ · ${cart.cart[product.id]}` : 'Ordina con sconto Poolite'}
            </Text>
          </PressableScale>
          <Text style={styles.footnote}>Consegna gratis sopra i 39 € · resi facili entro 30 giorni</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingBottom: 130 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  heroWrap: { height: 200, borderRadius: 24, overflow: 'hidden', marginTop: 14, position: 'relative' },
  pctBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: colors.amberBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  pctText: { color: colors.amber, fontSize: 14, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  badgePill: { backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '800' },
  ratingText: { fontSize: 13, color: colors.textSecondary },
  desc: { marginTop: 14, fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  priceRow: { flexDirection: 'row', gap: 10, alignItems: 'baseline', marginTop: 16 },
  price: { fontSize: 32, fontWeight: '800', color: colors.primary },
  oldPrice: { fontSize: 16, color: colors.textSecondary, textDecorationLine: 'line-through' },
  onlyWith: { fontSize: 13, fontWeight: '800', color: colors.amber },
  addBtn: { marginTop: 16, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  addBtnText: { fontWeight: '800', fontSize: 16 },
  footnote: { marginTop: 10, textAlign: 'center', fontSize: 12, color: colors.textSecondary },
});
