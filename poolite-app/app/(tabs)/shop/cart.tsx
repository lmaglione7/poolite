import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../../../src/components/PressableScale';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { ProductImage } from '../../../src/components/ProductImage';
import { Card } from '../../../src/components/Card';
import { WaveDivider } from '../../../src/components/WaveDivider';
import { colors } from '../../../src/theme/colors';
import { useCart } from '../../../src/state/CartContext';
import { useCatalog } from '../../../src/hooks/useCatalog';
import { useAuth } from '../../../src/state/AuthContext';
import { formatEuro } from '../../../src/data/products';
import { createPaymentIntent } from '../../../src/lib/checkout';
import { useAppStripe } from '../../../src/hooks/useAppStripe';
import { isStripeConfigured, isSupabaseConfigured } from '../../../src/lib/env';

export default function CartScreen() {
  const cart = useCart();
  const { byId } = useCatalog();
  const auth = useAuth();
  const stripe = useAppStripe();
  const [orderDone, setOrderDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const items = Object.entries(cart.cart)
    .map(([id, qty]) => ({ product: byId[id], qty }))
    .filter((i) => i.product);
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  async function checkout() {
    if (isSupabaseConfigured && isStripeConfigured && Platform.OS !== 'web') {
      if (!auth.user) {
        router.push('/(auth)/login');
        return;
      }
      setBusy(true);
      try {
        const { clientSecret } = await createPaymentIntent(items.map((i) => ({ product_id: i.product.id, qty: i.qty })));
        const initResult = await stripe.initPaymentSheet({ paymentIntentClientSecret: clientSecret, merchantDisplayName: 'Poolite' });
        if (initResult.error) throw new Error(initResult.error.message);
        const presentResult = await stripe.presentPaymentSheet();
        if (presentResult.error) {
          if (presentResult.error.code !== 'Canceled') Alert.alert('Pagamento non riuscito', presentResult.error.message);
          return;
        }
        cart.clear();
        setOrderDone(true);
      } catch (err: any) {
        Alert.alert('Qualcosa è andato storto', err.message ?? 'Riprova tra poco.');
      } finally {
        setBusy(false);
      }
    } else {
      // Backend/Stripe not wired up yet — keep the flow demoable.
      cart.clear();
      setOrderDone(true);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>Carrello</Text>
        </View>
        <WaveDivider />

        {orderDone ? (
          <Card tone="selected" style={{ alignItems: 'center', paddingVertical: 26 }}>
            <Text style={{ fontSize: 42 }}>🎉</Text>
            <Text style={styles.doneTitle}>Ordine ricevuto!</Text>
            <Text style={styles.doneBody}>Arriva in 2–3 giorni. Ti avviso io quando parte 📦</Text>
            <PrimaryButton label="Torna al negozio" onPress={() => router.replace('/(tabs)/shop')} style={{ marginTop: 14, paddingHorizontal: 28 }} />
          </Card>
        ) : items.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
            <Text style={{ fontSize: 38 }}>🛒</Text>
            <Text style={styles.emptyTitle}>Il carrello è vuoto</Text>
            <Text onPress={() => router.replace('/(tabs)/shop')} style={styles.emptyLink}>
              Guarda le offerte del giorno ›
            </Text>
          </Card>
        ) : (
          <>
            <View style={{ gap: 10 }}>
              {items.map(({ product, qty }) => (
                <View key={product.id} style={styles.itemRow}>
                  <ProductImage productId={product.id} width={52} height={52} radius={14} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={styles.itemName}>
                      {product.name}
                    </Text>
                    <Text style={styles.itemLine}>{formatEuro(product.price * qty)}</Text>
                  </View>
                  <View style={styles.stepper}>
                    <PressableScale scaleTo={0.9} onPress={() => cart.dec(product.id)} style={styles.stepBtn}>
                      <Text style={styles.stepBtnText}>−</Text>
                    </PressableScale>
                    <Text style={styles.qty}>{qty}</Text>
                    <PressableScale scaleTo={0.9} onPress={() => cart.inc(product.id)} style={[styles.stepBtn, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.stepBtnText, { color: '#FFFFFF' }]}>+</Text>
                    </PressableScale>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Totale</Text>
              <Text style={styles.totalValue}>{formatEuro(total)}</Text>
            </View>
            <PrimaryButton label={busy ? 'Un attimo…' : "Concludi l'ordine"} onPress={checkout} disabled={busy} style={{ marginTop: 12 }} />
            <Text style={styles.footnote}>Consegna gratis sopra i 39 € · resi facili entro 30 giorni</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingBottom: 130 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  doneTitle: { fontWeight: '800', fontSize: 18, color: colors.primary, marginTop: 8 },
  doneBody: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
  emptyTitle: { fontWeight: '800', fontSize: 16, color: colors.primary, marginTop: 8 },
  emptyLink: { marginTop: 8, fontSize: 14, color: colors.accent, fontWeight: '700' },
  itemRow: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemName: { fontWeight: '700', fontSize: 14, color: colors.textPrimary },
  itemLine: { fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontWeight: '800', color: colors.primary },
  qty: { fontWeight: '800', fontSize: 15, color: colors.textPrimary, minWidth: 14, textAlign: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 18, paddingHorizontal: 4 },
  totalLabel: { fontSize: 15, color: colors.textSecondary, fontWeight: '700' },
  totalValue: { fontSize: 26, fontWeight: '800', color: colors.primary },
  footnote: { marginTop: 10, textAlign: 'center', fontSize: 12, color: colors.textSecondary },
});
