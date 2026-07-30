import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../../../src/components/PressableScale';
import { ProductImage } from '../../../src/components/ProductImage';
import { CartButton } from '../../../src/components/shop/CartButton';
import { TrustRow } from '../../../src/components/shop/TrustRow';
import { Card } from '../../../src/components/Card';
import { colors } from '../../../src/theme/colors';
import { useCatalog } from '../../../src/hooks/useCatalog';
import { useCart } from '../../../src/state/CartContext';
import { useSubscriptions, SUBSCRIPTION_DISCOUNT } from '../../../src/state/SubscriptionsContext';
import { formatEuro, pctOff, starString } from '../../../src/data/products';
import { reviewsForProduct } from '../../../src/data/reviews';
import { scheduleSubscriptionReminder } from '../../../src/lib/notifications';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId } = useCatalog();
  const cart = useCart();
  const subs = useSubscriptions();
  const product = byId[id ?? ''];

  if (!product) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.textSecondary }}>Prodotto non trovato.</Text>
      </SafeAreaView>
    );
  }

  const inCart = !!cart.cart[product.id];
  const subscribed = subs.isSubscribed(product.id);
  const suggestedWeeks = subs.suggestedWeeks(product.id);
  const reviews = reviewsForProduct(product.id);
  const subscribable = ['chimici', 'accessori'].includes(product.cat);

  function toggleSubscription() {
    if (subscribed) {
      subs.unsubscribe(product.id);
    } else {
      subs.subscribe(product.id);
      const next = new Date();
      next.setDate(next.getDate() + suggestedWeeks * 7);
      scheduleSubscriptionReminder(product.name, next.toISOString().slice(0, 10));
    }
  }

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
          <ProductImage productId={product.id} imageUrl={product.imageUrl} width={400} height={200} radius={24} style={{ width: '100%' }} />
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
          <View style={styles.nextDayBadge}>
            <Text style={styles.nextDayText}>🚚 Ordina entro le 12:00 → arriva domani</Text>
          </View>
          <Text style={styles.footnote}>Consegna gratis sopra i 39 € · express gratuita sopra i 99 € · resi entro 30 giorni</Text>

          <PressableScale scaleTo={0.98} onPress={() => router.push(`/manuale/${product.id}`)}>
            <Card soft style={{ marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 26 }}>📖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.manualTitle}>Manuale passo-passo</Text>
                <Text style={styles.manualSub}>Come si usa, spiegato semplice. Niente lasciato al caso.</Text>
              </View>
              <Text style={styles.manualChevron}>›</Text>
            </Card>
          </PressableScale>

          <TrustRow style={{ marginTop: 14 }} />

          {subscribable && (
            <Card tone={subscribed ? 'selected' : 'amber'} style={{ marginTop: 16 }}>
              <View style={styles.subHeaderRow}>
                <Text style={{ fontSize: 22 }}>📦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subTitle}>Scorta automatica −10%</Text>
                  <Text style={styles.subBody}>
                    {subscribed
                      ? `Attiva: arriva ogni ${subs.getSubscription(product.id)?.weeks ?? suggestedWeeks} settimane a ${formatEuro(product.price * (1 - SUBSCRIPTION_DISCOUNT))}. Gestiscila da "Le tue scorte".`
                      : `Al ritmo dei tuoi trattamenti ti serve ogni ~${suggestedWeeks} settimane. Te la mando io a ${formatEuro(product.price * (1 - SUBSCRIPTION_DISCOUNT))}, salti o metti in pausa quando vuoi.`}
                  </Text>
                </View>
              </View>
              <PressableScale
                onPress={toggleSubscription}
                style={[styles.subBtn, { backgroundColor: subscribed ? colors.card : colors.primary, borderWidth: subscribed ? 1 : 0, borderColor: colors.border }]}
              >
                <Text style={[styles.subBtnText, { color: subscribed ? colors.error : '#FFFFFF' }]}>
                  {subscribed ? 'Disattiva scorta' : 'Attiva la scorta automatica'}
                </Text>
              </PressableScale>
            </Card>
          )}

          {reviews.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.reviewsTitle}>Recensioni di piscine come la tua</Text>
              <Text style={styles.reviewsSub}>Solo da chi ha comprato davvero, con la sua piscina accanto.</Text>
              <View style={{ gap: 10, marginTop: 10 }}>
                {reviews.map((r) => (
                  <Card key={r.id} soft>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{r.author}</Text>
                      {r.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>✓ Acquisto verificato</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.reviewStars}>{starString(r.rating)}</Text>
                    <Text style={styles.reviewText}>{r.text}</Text>
                    <View style={styles.reviewContextPill}>
                      <Text style={styles.reviewContextText}>🏊 {r.poolContext}</Text>
                    </View>
                    <Text style={styles.reviewMeta}>
                      utile per {r.helpfulCount} persone · {r.monthsAgo === 1 ? 'un mese fa' : `${r.monthsAgo} mesi fa`}
                    </Text>
                  </Card>
                ))}
              </View>
            </View>
          )}
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
  footnote: { marginTop: 8, textAlign: 'center', fontSize: 12, color: colors.textSecondary },
  nextDayBadge: { marginTop: 10, alignSelf: 'center', backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  nextDayText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  manualTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  manualSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  manualChevron: { color: colors.accent, fontWeight: '800', fontSize: 18 },
  subHeaderRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  subTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  subBody: { fontSize: 13, color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
  subBtn: { marginTop: 12, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  subBtnText: { fontWeight: '800', fontSize: 14 },
  reviewsTitle: { fontWeight: '800', fontSize: 17, color: colors.textPrimary },
  reviewsSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { fontWeight: '800', fontSize: 14, color: colors.textPrimary },
  verifiedBadge: { backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  reviewStars: { fontSize: 13, color: colors.accent, marginTop: 4 },
  reviewText: { fontSize: 14, color: colors.textPrimary, marginTop: 6, lineHeight: 20 },
  reviewContextPill: { alignSelf: 'flex-start', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  reviewContextText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  reviewMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
});
