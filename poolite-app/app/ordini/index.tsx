import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { WaveDivider } from '../../src/components/WaveDivider';
import { PressableScale } from '../../src/components/PressableScale';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ProductImage } from '../../src/components/ProductImage';
import { colors } from '../../src/theme/colors';
import { useOrders, STATUS_META, OrderStatus } from '../../src/state/OrdersContext';
import { formatEuro } from '../../src/data/products';

const FILTERS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'Tutti' },
  { id: 'preparing', label: 'In preparazione' },
  { id: 'shipped', label: 'Spediti' },
  { id: 'delivered', label: 'Consegnati' },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

export default function OrdersScreen() {
  const { orders } = useOrders();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const shown = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'preparing') return o.status === 'paid' || o.status === 'preparing';
    return o.status === filter;
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={{ paddingHorizontal: 18 }}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>I miei ordini</Text>
        </View>
        <WaveDivider />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={{ flexGrow: 0 }}>
        {FILTERS.map((f) => (
          <PressableScale
            key={f.id}
            haptic={false}
            onPress={() => setFilter(f.id)}
            style={[styles.filterChip, filter === f.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={[styles.filterText, filter === f.id && { color: '#FFFFFF' }]}>{f.label}</Text>
          </PressableScale>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        {shown.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
            <Text style={{ fontSize: 40 }}>📦</Text>
            <Text style={styles.emptyTitle}>
              {orders.length === 0 ? 'Nessun ordine, per ora' : 'Nessun ordine in questa categoria'}
            </Text>
            {orders.length === 0 && (
              <>
                <Text style={styles.emptyBody}>Quando ordinerai qualcosa lo troverai qui, con lo stato sempre aggiornato.</Text>
                <PrimaryButton label="Vai al negozio" onPress={() => router.replace('/(tabs)/shop')} style={{ marginTop: 14, paddingHorizontal: 28 }} />
              </>
            )}
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {shown.map((o) => {
              const meta = STATUS_META[o.status];
              return (
                <PressableScale key={o.id} scaleTo={0.99} onPress={() => router.push(`/ordini/${o.id}`)}>
                  <Card soft>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderNumber}>{o.number}</Text>
                        <Text style={styles.orderDate}>{formatDate(o.createdAtISO)}</Text>
                      </View>
                      <View style={[styles.statusPill, meta.color === 'amber' && { backgroundColor: colors.amberBg }]}>
                        <Text style={[styles.statusText, meta.color === 'amber' && { color: colors.amber }]}>
                          {meta.emoji} {meta.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.thumbRow}>
                      {o.lines.slice(0, 4).map((l) => (
                        <ProductImage key={l.productId} productId={l.productId} imageUrl={l.imageUrl} width={46} height={46} radius={10} />
                      ))}
                      {o.lines.length > 4 && (
                        <View style={styles.moreThumb}>
                          <Text style={styles.moreThumbText}>+{o.lines.length - 4}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }} />
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.totalLabel}>Totale</Text>
                        <Text style={styles.totalValue}>{formatEuro(o.total)}</Text>
                      </View>
                    </View>
                  </Card>
                </PressableScale>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  filterRow: { paddingHorizontal: 18, gap: 8, paddingBottom: 12 },
  filterChip: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card },
  filterText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  content: { paddingHorizontal: 18, paddingBottom: 60 },
  emptyTitle: { fontWeight: '800', fontSize: 16, color: colors.primary, marginTop: 10, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderNumber: { fontWeight: '800', fontSize: 15, color: colors.textPrimary, letterSpacing: 0.5 },
  orderDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusPill: { backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  thumbRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moreThumb: { width: 46, height: 46, borderRadius: 10, backgroundColor: colors.selectedBg, alignItems: 'center', justifyContent: 'center' },
  moreThumbText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  totalLabel: { fontSize: 11, color: colors.textSecondary },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
});
