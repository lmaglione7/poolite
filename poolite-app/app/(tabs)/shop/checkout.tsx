import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../src/components/Card';
import { WaveDivider } from '../../../src/components/WaveDivider';
import { PressableScale } from '../../../src/components/PressableScale';
import { ProductImage } from '../../../src/components/ProductImage';
import { PaymentMark, PaymentMarks } from '../../../src/components/shop/PaymentMarks';
import { colors } from '../../../src/theme/colors';
import { useCart } from '../../../src/state/CartContext';
import { useCatalog } from '../../../src/hooks/useCatalog';
import { useAuth } from '../../../src/state/AuthContext';
import { useRewards } from '../../../src/state/RewardsContext';
import { useAddresses, formatAddressLines } from '../../../src/state/AddressContext';
import { useOrders } from '../../../src/state/OrdersContext';
import { formatEuro } from '../../../src/data/products';
import {
  FREE_SHIPPING_MIN,
  FAST_SHIPPING_MIN,
  PAYMENT_METHODS,
  PaymentMethodId,
  ShippingSpeed,
  shippingCostFor,
} from '../../../src/data/commerce';
import { isRemoteArea } from '../../../src/data/provinces';
import { createPaymentIntent } from '../../../src/lib/checkout';
import { useAppStripe } from '../../../src/hooks/useAppStripe';
import { isStripeConfigured, isSupabaseConfigured } from '../../../src/lib/env';

// AliExpress-style single-page checkout: address → shipping → payment →
// summary → pay. Everything visible at once, nothing hidden behind steps.
export default function CheckoutScreen() {
  const cart = useCart();
  const { byId } = useCatalog();
  const auth = useAuth();
  const rewards = useRewards();
  const orders = useOrders();
  const { defaultAddress } = useAddresses();
  const stripe = useAppStripe();

  const [speed, setSpeed] = useState<ShippingSpeed>('standard');
  const [payment, setPayment] = useState<PaymentMethodId>('card');
  const [busy, setBusy] = useState(false);

  const items = Object.entries(cart.cart)
    .map(([id, qty]) => ({ product: byId[id], qty }))
    .filter((i) => i.product);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const coupon = rewards.bestCouponFor(subtotal);
  const discount = coupon ? Math.min(coupon.amount, subtotal) : 0;
  const shippingCost = shippingCostFor(subtotal, speed);
  const total = Math.max(0, subtotal - discount) + shippingCost;

  const remote = defaultAddress ? isRemoteArea(defaultAddress.province) : false;

  async function pay() {
    if (!defaultAddress) {
      Alert.alert('Manca l’indirizzo', 'Aggiungi un indirizzo di spedizione per continuare.');
      return;
    }
    if (isSupabaseConfigured && isStripeConfigured && Platform.OS !== 'web') {
      if (!auth.user) {
        router.push('/(auth)/login');
        return;
      }
      setBusy(true);
      try {
        const { clientSecret, orderId } = await createPaymentIntent(
          items.map((i) => ({ product_id: i.product.id, qty: i.qty })),
          coupon?.code ?? null,
          { addressId: defaultAddress.id, shippingSpeed: speed }
        );
        const init = await stripe.initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Poolite',
          applePay: { merchantCountryCode: 'IT' },
          googlePay: { merchantCountryCode: 'IT', testEnv: true },
        });
        if (init.error) throw new Error(init.error.message);
        const res = await stripe.presentPaymentSheet();
        if (res.error) {
          if (res.error.code !== 'Canceled') Alert.alert('Pagamento non riuscito', res.error.message);
          return;
        }
        finishOrder(orderId);
      } catch (err: any) {
        Alert.alert('Qualcosa è andato storto', err.message ?? 'Riprova tra poco.');
      } finally {
        setBusy(false);
      }
    } else {
      // Demo mode (no backend/Stripe configured yet, or web preview).
      finishOrder();
    }
  }

  function finishOrder(serverOrderId?: string) {
    const order = orders.addOrder({
      id: serverOrderId,
      lines: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        qty: i.qty,
        unitPrice: i.product.price,
        imageUrl: i.product.imageUrl,
      })),
      subtotal,
      discount,
      couponCode: coupon?.code ?? null,
      shippingCost,
      shippingSpeed: speed,
      total,
      address: defaultAddress!,
    });
    if (coupon) rewards.markCouponUsed(coupon.code);
    rewards.registerOrder();
    cart.clear();
    router.replace(`/ordine-confermato?id=${order.id}`);
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.textSecondary }}>Il carrello è vuoto.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>Conferma ordine</Text>
        </View>
        <WaveDivider />

        {/* 1. Address */}
        <Text style={styles.stepTitle}>1 · Dove lo spediamo</Text>
        <PressableScale
          scaleTo={0.99}
          onPress={() => router.push(defaultAddress ? '/indirizzi?select=1' : '/indirizzi/nuovo')}
        >
          <Card soft style={!defaultAddress ? { borderColor: colors.error, borderWidth: 1.5 } : undefined}>
            {defaultAddress ? (
              <View style={styles.addrRow}>
                <Text style={{ fontSize: 22 }}>📍</Text>
                <View style={{ flex: 1 }}>
                  {formatAddressLines(defaultAddress).map((line, i) => (
                    <Text key={i} style={i === 0 ? styles.addrName : styles.addrLine}>
                      {line}
                    </Text>
                  ))}
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            ) : (
              <View style={styles.addrRow}>
                <Text style={{ fontSize: 22 }}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addrMissing}>Aggiungi un indirizzo di spedizione</Text>
                  <Text style={styles.addrLine}>Serve per farti arrivare il pacco</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            )}
          </Card>
        </PressableScale>

        {/* 2. Shipping */}
        <Text style={styles.stepTitle}>2 · Come lo spediamo</Text>
        <View style={{ gap: 10 }}>
          {(['standard', 'express'] as ShippingSpeed[]).map((s) => {
            const cost = shippingCostFor(subtotal, s);
            const selected = speed === s;
            const disabled = s === 'express' && remote;
            return (
              <PressableScale
                key={s}
                scaleTo={0.99}
                haptic={false}
                onPress={() => !disabled && setSpeed(s)}
                style={[
                  styles.optionCard,
                  selected && { borderColor: colors.accent, backgroundColor: colors.selectedBg },
                  disabled && { opacity: 0.5 },
                ]}
              >
                <View style={[styles.radio, selected && { borderColor: colors.accent, backgroundColor: colors.accent }]}>
                  {selected && <Text style={styles.radioDot}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>{s === 'express' ? 'Express · 24/48 ore' : 'Standard · 2–3 giorni'}</Text>
                  <Text style={styles.optionHint}>
                    {disabled
                      ? 'Non disponibile per la tua zona'
                      : s === 'express'
                        ? `Gratis sopra i ${FAST_SHIPPING_MIN} €`
                        : `Gratis sopra i ${FREE_SHIPPING_MIN} €`}
                  </Text>
                </View>
                <Text style={[styles.optionPrice, cost === 0 && { color: colors.accent }]}>
                  {cost === 0 ? 'Gratis' : formatEuro(cost)}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {/* 3. Payment */}
        <Text style={styles.stepTitle}>3 · Come paghi</Text>
        <View style={{ gap: 10 }}>
          {PAYMENT_METHODS.map((m) => {
            const selected = payment === m.id;
            return (
              <PressableScale
                key={m.id}
                scaleTo={0.99}
                haptic={false}
                onPress={() => setPayment(m.id)}
                style={[styles.optionCard, selected && { borderColor: colors.accent, backgroundColor: colors.selectedBg }]}
              >
                <View style={[styles.radio, selected && { borderColor: colors.accent, backgroundColor: colors.accent }]}>
                  {selected && <Text style={styles.radioDot}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>{m.label}</Text>
                  <Text style={styles.optionHint}>{m.hint}</Text>
                </View>
                <PaymentMark logoKey={m.logoKey} label={m.label} height={20} />
              </PressableScale>
            );
          })}
        </View>

        {/* 4. Summary */}
        <Text style={styles.stepTitle}>4 · Riepilogo</Text>
        <Card soft style={{ padding: 0, overflow: 'hidden' }}>
          {items.map(({ product, qty }, i) => (
            <View key={product.id} style={[styles.lineRow, i === items.length - 1 && { borderBottomWidth: 0 }]}>
              <ProductImage productId={product.id} imageUrl={product.imageUrl} width={44} height={44} radius={10} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lineName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.lineQty}>× {qty}</Text>
              </View>
              <Text style={styles.linePrice}>{formatEuro(product.price * qty)}</Text>
            </View>
          ))}
        </Card>

        <Card soft style={{ marginTop: 10 }}>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Subtotale</Text>
            <Text style={styles.sumValue}>{formatEuro(subtotal)}</Text>
          </View>
          {coupon && (
            <View style={styles.sumRow}>
              <Text style={[styles.sumLabel, { color: colors.amber }]}>🎁 {coupon.label}</Text>
              <Text style={[styles.sumValue, { color: colors.amber }]}>− {formatEuro(discount)}</Text>
            </View>
          )}
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Spedizione</Text>
            <Text style={[styles.sumValue, shippingCost === 0 && { color: colors.accent }]}>
              {shippingCost === 0 ? 'Gratis' : formatEuro(shippingCost)}
            </Text>
          </View>
          <View style={[styles.sumRow, styles.sumTotal]}>
            <Text style={styles.sumTotalLabel}>Totale</Text>
            <Text style={styles.sumTotalValue}>{formatEuro(total)}</Text>
          </View>
          <Text style={styles.vatNote}>IVA inclusa</Text>
        </Card>

        <PressableScale
          onPress={pay}
          disabled={busy || !defaultAddress}
          style={[styles.payBtn, (busy || !defaultAddress) && { opacity: 0.5 }]}
        >
          <Text style={styles.payBtnText}>{busy ? 'Un attimo…' : `Paga ${formatEuro(total)}`}</Text>
        </PressableScale>

        <PaymentMarks style={{ marginTop: 16 }} showLabel={false} />
        <Text style={styles.legalNote}>
          Completando l’ordine accetti i Termini e condizioni. Hai 30 giorni per il reso.
        </Text>
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
  stepTitle: { fontWeight: '800', fontSize: 13, color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addrName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  addrLine: { fontSize: 13, color: colors.textSecondary, marginTop: 1, lineHeight: 18 },
  addrMissing: { fontSize: 15, fontWeight: '800', color: colors.error },
  chevron: { color: colors.accent, fontWeight: '800', fontSize: 18 },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: 16, padding: 14 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  optionLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  optionHint: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  optionPrice: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.background },
  lineName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  lineQty: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  linePrice: { fontSize: 14, fontWeight: '800', color: colors.primary },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  sumLabel: { fontSize: 14, color: colors.textSecondary },
  sumValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sumTotal: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 10 },
  sumTotalLabel: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  sumTotalValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  vatNote: { fontSize: 11, color: colors.textSecondary, textAlign: 'right', marginTop: 2 },
  payBtn: { marginTop: 18, backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 18, alignItems: 'center', shadowColor: '#0E5A6D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16 },
  payBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17 },
  legalNote: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 16 },
});
