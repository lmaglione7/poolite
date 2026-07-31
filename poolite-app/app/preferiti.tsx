import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { WaveDivider } from '../src/components/WaveDivider';
import { PressableScale } from '../src/components/PressableScale';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { ProductImage } from '../src/components/ProductImage';
import { WishlistButton } from '../src/components/shop/WishlistButton';
import { colors } from '../src/theme/colors';
import { useWishlist } from '../src/state/WishlistContext';
import { useCart } from '../src/state/CartContext';
import { useCatalog } from '../src/hooks/useCatalog';
import { formatEuro, pctOff, starString } from '../src/data/products';

export default function WishlistScreen() {
  const wishlist = useWishlist();
  const cart = useCart();
  const { byId } = useCatalog();
  const items = wishlist.ids.map((id) => byId[id]).filter(Boolean);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>I tuoi preferiti</Text>
        </View>
        <WaveDivider />

        {items.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
            <Text style={{ fontSize: 40 }}>🤍</Text>
            <Text style={styles.emptyTitle}>Nessun preferito</Text>
            <Text style={styles.emptyBody}>Tocca il cuore su un prodotto per tenerlo d’occhio: ti avviso se va in offerta.</Text>
            <PrimaryButton label="Vai al negozio" onPress={() => router.replace('/(tabs)/shop')} style={{ marginTop: 14, paddingHorizontal: 28 }} />
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {items.map((p) => (
              <Card key={p.id} soft>
                <View style={styles.row}>
                  <PressableScale haptic={false} onPress={() => router.push(`/(tabs)/shop/${p.id}`)}>
                    <ProductImage productId={p.id} imageUrl={p.imageUrl} width={64} height={64} radius={14} />
                  </PressableScale>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.rating}>
                      {starString(p.rating)} <Text style={styles.ratingNum}>{p.rating.toFixed(1).replace('.', ',')}</Text>
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatEuro(p.price)}</Text>
                      {p.old && <Text style={styles.oldPrice}>{formatEuro(p.old)}</Text>}
                      {p.old && (
                        <View style={styles.pctBadge}>
                          <Text style={styles.pctText}>{pctOff(p)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <WishlistButton productId={p.id} />
                </View>
                <PressableScale onPress={() => cart.add(p.id)} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>
                    {cart.cart[p.id] ? `Nel carrello ✓ · ${cart.cart[p.id]}` : 'Aggiungi al carrello'}
                  </Text>
                </PressableScale>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  emptyTitle: { fontWeight: '800', fontSize: 16, color: colors.primary, marginTop: 10 },
  emptyBody: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontWeight: '700', fontSize: 14, color: colors.textPrimary },
  rating: { fontSize: 11, color: colors.accent, marginTop: 3 },
  ratingNum: { color: colors.textSecondary, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  price: { fontSize: 17, fontWeight: '800', color: colors.primary },
  oldPrice: { fontSize: 12, color: colors.textSecondary, textDecorationLine: 'line-through' },
  pctBadge: { backgroundColor: colors.amberBg, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  pctText: { fontSize: 10, fontWeight: '800', color: colors.amber },
  addBtn: { marginTop: 12, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 11, alignItems: 'center' },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
