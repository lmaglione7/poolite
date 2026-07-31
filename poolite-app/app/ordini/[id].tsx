import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { WaveDivider } from '../../src/components/WaveDivider';
import { PressableScale } from '../../src/components/PressableScale';
import { ProductImage } from '../../src/components/ProductImage';
import { colors } from '../../src/theme/colors';
import { useOrders, STATUS_META, TRACKING_STEPS, orderProgress } from '../../src/state/OrdersContext';
import { useCart } from '../../src/state/CartContext';
import { formatAddressLines } from '../../src/state/AddressContext';
import { formatEuro } from '../../src/data/products';

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = useOrders();
  const cart = useCart();
  const order = getById(id ?? '');

  if (!order) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.textSecondary }}>Ordine non trovato.</Text>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[order.status];
  const currentStep = orderProgress(order.status);
  const cancelled = order.status === 'cancelled';

  function reorder() {
    order!.lines.forEach((l) => cart.setQty(l.productId, l.qty));
    router.push('/(tabs)/shop/cart');
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Ordine {order.number}</Text>
            <Text style={styles.subtitle}>{formatDateTime(order.createdAtISO)}</Text>
          </View>
        </View>
        <WaveDivider />

        {/* Tracking timeline */}
        <Card soft>
          <View style={styles.statusHeader}>
            <Text style={styles.statusBig}>
              {meta.emoji} {meta.label}
            </Text>
            {order.estimatedDeliveryISO && !cancelled && order.status !== 'delivered' && (
              <Text style={styles.eta}>Consegna prevista {formatDay(order.estimatedDeliveryISO)}</Text>
            )}
          </View>

          {cancelled ? (
            <Text style={styles.cancelledText}>Questo ordine è stato annullato. Se hai pagato, il rimborso arriva entro 14 giorni.</Text>
          ) : (
            <View style={{ marginTop: 14 }}>
              {TRACKING_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const isCurrent = i === currentStep;
                const isLast = i === TRACKING_STEPS.length - 1;
                return (
                  <View key={step.status} style={styles.stepRow}>
                    <View style={styles.stepGutter}>
                      <View style={[styles.stepDot, done && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                        {done && <Text style={styles.stepCheck}>✓</Text>}
                      </View>
                      {!isLast && <View style={[styles.stepLine, i < currentStep && { backgroundColor: colors.accent }]} />}
                    </View>
                    <View style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
                      <Text style={[styles.stepLabel, done && { color: colors.textPrimary }, isCurrent && { fontWeight: '800' }]}>
                        {step.label}
                      </Text>
                      <Text style={styles.stepHint}>{step.hint}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {order.trackingCode && (
            <View style={styles.trackingBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackingLabel}>{order.carrier ?? 'Corriere'}</Text>
                <Text style={styles.trackingCode}>{order.trackingCode}</Text>
              </View>
              <PressableScale
                onPress={() => Alert.alert('Tracciamento', 'Il collegamento al sito del corriere si attiva quando l’ordine viene affidato alla spedizione.')}
                style={styles.trackBtn}
              >
                <Text style={styles.trackBtnText}>Traccia</Text>
              </PressableScale>
            </View>
          )}
        </Card>

        {/* Products */}
        <Text style={styles.sectionTitle}>Prodotti</Text>
        <Card soft style={{ padding: 0, overflow: 'hidden' }}>
          {order.lines.map((l, i) => (
            <View key={l.productId} style={[styles.lineRow, i === order.lines.length - 1 && { borderBottomWidth: 0 }]}>
              <ProductImage productId={l.productId} imageUrl={l.imageUrl} width={52} height={52} radius={12} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lineName} numberOfLines={2}>{l.name}</Text>
                <Text style={styles.lineQty}>Quantità: {l.qty}</Text>
              </View>
              <Text style={styles.linePrice}>{formatEuro(l.unitPrice * l.qty)}</Text>
            </View>
          ))}
        </Card>

        {/* Totals */}
        <Text style={styles.sectionTitle}>Riepilogo</Text>
        <Card soft>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Subtotale</Text>
            <Text style={styles.sumValue}>{formatEuro(order.subtotal)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.sumRow}>
              <Text style={[styles.sumLabel, { color: colors.amber }]}>Coupon {order.couponCode}</Text>
              <Text style={[styles.sumValue, { color: colors.amber }]}>− {formatEuro(order.discount)}</Text>
            </View>
          )}
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Spedizione {order.shippingSpeed === 'express' ? 'express' : 'standard'}</Text>
            <Text style={styles.sumValue}>{order.shippingCost === 0 ? 'Gratis' : formatEuro(order.shippingCost)}</Text>
          </View>
          <View style={[styles.sumRow, styles.sumTotal]}>
            <Text style={styles.sumTotalLabel}>Totale</Text>
            <Text style={styles.sumTotalValue}>{formatEuro(order.total)}</Text>
          </View>
        </Card>

        {/* Address */}
        <Text style={styles.sectionTitle}>Spedito a</Text>
        <Card soft>
          {formatAddressLines(order.address).map((line, i) => (
            <Text key={i} style={i === 0 ? styles.addrName : styles.addrLine}>
              {line}
            </Text>
          ))}
          {order.address.notes ? <Text style={styles.addrNotes}>Note: {order.address.notes}</Text> : null}
        </Card>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <PressableScale onPress={reorder} style={styles.actionPrimary}>
            <Text style={styles.actionPrimaryText}>Ordina di nuovo</Text>
          </PressableScale>
          <PressableScale
            onPress={() =>
              Alert.alert(
                'Serve aiuto?',
                'Scrivici a supporto@poolite.it indicando il numero ordine ' + order.number + ': ti rispondiamo entro un giorno lavorativo.'
              )
            }
            style={styles.actionSecondary}
          >
            <Text style={styles.actionSecondaryText}>Assistenza</Text>
          </PressableScale>
        </View>
        {order.status === 'delivered' && (
          <Text style={styles.returnNote}>Hai 30 giorni dalla consegna per il reso. Scrivici a resi@poolite.it.</Text>
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
  title: { fontSize: 20, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  statusHeader: { gap: 3 },
  statusBig: { fontSize: 17, fontWeight: '800', color: colors.primary },
  eta: { fontSize: 13, color: colors.accent, fontWeight: '700' },
  cancelledText: { fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepGutter: { alignItems: 'center', width: 22 },
  stepDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  stepCheck: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  stepLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  stepLabel: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  stepHint: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  trackingBox: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14, backgroundColor: colors.background, borderRadius: 14, padding: 12 },
  trackingLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '700' },
  trackingCode: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.5 },
  trackBtn: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 9 },
  trackBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  sectionTitle: { fontWeight: '800', fontSize: 13, color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 8, paddingHorizontal: 4 },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.background },
  lineName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  lineQty: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  linePrice: { fontSize: 15, fontWeight: '800', color: colors.primary },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  sumLabel: { fontSize: 14, color: colors.textSecondary },
  sumValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sumTotal: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 10 },
  sumTotalLabel: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  sumTotalValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  addrName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  addrLine: { fontSize: 14, color: colors.textSecondary, marginTop: 2, lineHeight: 20 },
  addrNotes: { fontSize: 13, color: colors.accent, marginTop: 6, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionPrimary: { flex: 1, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  actionPrimaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  actionSecondary: { flex: 1, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  actionSecondaryText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  returnNote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 12, lineHeight: 17 },
});
