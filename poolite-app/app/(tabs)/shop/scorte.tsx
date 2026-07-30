import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../../../src/components/PressableScale';
import { ProductImage } from '../../../src/components/ProductImage';
import { Card } from '../../../src/components/Card';
import { WaveDivider } from '../../../src/components/WaveDivider';
import { colors } from '../../../src/theme/colors';
import { useSubscriptions, SUBSCRIPTION_DISCOUNT } from '../../../src/state/SubscriptionsContext';
import { useCatalog } from '../../../src/hooks/useCatalog';
import { formatEuro } from '../../../src/data/products';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' }).format(new Date(iso + 'T12:00:00'));
}

export default function ScorteScreen() {
  const subs = useSubscriptions();
  const { byId } = useCatalog();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>Le tue scorte</Text>
        </View>
        <WaveDivider />

        {subs.subscriptions.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
            <Text style={{ fontSize: 38 }}>📦</Text>
            <Text style={styles.emptyTitle}>Nessuna scorta automatica attiva</Text>
            <Text style={styles.emptyBody}>
              Attivala dalla pagina di un prodotto: arriva al tuo ritmo, con il 10% di sconto, e puoi saltarla o metterla in pausa quando vuoi.
            </Text>
            <PressableScale haptic={false} onPress={() => router.replace('/(tabs)/shop')}>
              <Text style={styles.emptyLink}>Vai al negozio ›</Text>
            </PressableScale>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {subs.subscriptions.map((s) => {
              const product = byId[s.productId];
              if (!product) return null;
              const discounted = product.price * (1 - SUBSCRIPTION_DISCOUNT);
              return (
                <Card key={s.productId} soft style={s.paused ? { opacity: 0.65 } : undefined}>
                  <View style={styles.subRow}>
                    <ProductImage productId={product.id} imageUrl={product.imageUrl} width={52} height={52} radius={14} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.subMeta}>
                        ogni {s.weeks} settimane · <Text style={{ fontWeight: '800', color: colors.primary }}>{formatEuro(discounted)}</Text>{' '}
                        <Text style={styles.strike}>{formatEuro(product.price)}</Text>
                      </Text>
                      <Text style={styles.subNext}>
                        {s.paused ? 'In pausa' : `Prossima consegna: ${formatDate(s.nextDateISO)}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionsRow}>
                    {!s.paused && (
                      <PressableScale onPress={() => subs.skipNext(s.productId)} style={styles.actionBtn}>
                        <Text style={styles.actionText}>Salta la prossima</Text>
                      </PressableScale>
                    )}
                    <PressableScale onPress={() => subs.setPaused(s.productId, !s.paused)} style={styles.actionBtn}>
                      <Text style={styles.actionText}>{s.paused ? 'Riattiva' : 'Pausa'}</Text>
                    </PressableScale>
                    <PressableScale onPress={() => subs.unsubscribe(s.productId)} style={styles.actionBtn}>
                      <Text style={[styles.actionText, { color: colors.error }]}>Disattiva</Text>
                    </PressableScale>
                  </View>
                </Card>
              );
            })}
            <Text style={styles.footnote}>
              Ti avvisiamo 3 giorni prima di ogni invio. Nessun vincolo: pausa, salto o disattivazione con un tap.
            </Text>
          </View>
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
  emptyTitle: { fontWeight: '800', fontSize: 16, color: colors.primary, marginTop: 8, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  emptyLink: { marginTop: 10, fontSize: 14, color: colors.accent, fontWeight: '700' },
  subRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  subName: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  subMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  strike: { textDecorationLine: 'line-through', fontSize: 12 },
  subNext: { fontSize: 12, color: colors.accent, fontWeight: '700', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 9, alignItems: 'center', backgroundColor: colors.background },
  actionText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  footnote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 17 },
});
