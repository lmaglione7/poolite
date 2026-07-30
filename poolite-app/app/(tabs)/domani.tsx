import { View, Text, StyleSheet } from 'react-native';
import { TabScreen } from '../../src/components/TabScreen';
import { WaveDivider } from '../../src/components/WaveDivider';
import { Card } from '../../src/components/Card';
import { DealHookCard } from '../../src/components/shop/DealHookCard';
import { colors } from '../../src/theme/colors';
import { useWeatherCost } from '../../src/hooks/useWeatherCost';
import { useCatalog } from '../../src/hooks/useCatalog';
import { formatEuro } from '../../src/data/products';
import { formatItalianDayDate } from '../../src/lib/dates';

const HOT_DAY_THRESHOLD = 30;

export default function DomaniTab() {
  const { loading, netError, tomorrow, retry } = useWeatherCost();
  const { byId } = useCatalog();
  const hotDay = !!tomorrow && tomorrow.tempMax >= HOT_DAY_THRESHOLD;

  return (
    <TabScreen onRefresh={retry} refreshing={loading}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Domani</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {tomorrow ? `${formatItalianDayDate(tomorrow.dateISO)} · max ${tomorrow.tempMax} °C` : '…'}
        </Text>
      </View>
      <WaveDivider />

      {netError ? (
        <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
          <Text style={styles.errorEmoji}>🌥</Text>
          <Text style={styles.errorTitle}>Il piano di domani arriva appena torna la linea</Text>
          <Text style={styles.errorBody}>Nel frattempo va benissimo la fascia di oggi.</Text>
        </Card>
      ) : tomorrow ? (
        <>
          <Card tone="primary" style={{ alignItems: 'center' }}>
            <Text style={styles.planLabel}>IL PIANO DI DOMANI</Text>
            <Text style={styles.planHours}>{tomorrow.hourRange}</Text>
            <Text style={styles.planSub}>
              {tomorrow.cost.hours} ore di pompa · costo stimato <Text style={{ fontWeight: '800' }}>{formatEuro(tomorrow.cost.costToday)}</Text>
            </Text>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Risparmi {formatEuro(tomorrow.cost.savingsToday)}</Text>
            </View>
          </Card>

          {hotDay && (
            <Card tone="amber" style={{ marginTop: 12, flexDirection: 'row', gap: 12 }}>
              <Text style={{ fontSize: 22 }}>🔥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.extraTitle}>Consiglio extra</Text>
                <Text style={styles.extraBody}>Giornata calda in arrivo: copri la piscina stasera e l’acqua resta pulita più a lungo.</Text>
              </View>
            </Card>
          )}

          <Card soft style={{ marginTop: 12 }}>
            <Text style={styles.whyTitle}>Perché queste ore?</Text>
            <Text style={styles.whyBody}>Domani il sole scalda di più in questa fascia e la corrente costa meno: la pompa lavora quando conviene.</Text>
          </Card>

          {hotDay && byId.telo && <DealHookCard product={byId.telo} label="OFFERTA PER IL CONSIGLIO DI STASERA" />}
        </>
      ) : null}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4, paddingTop: 6 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  meta: { fontSize: 13, color: colors.textSecondary, fontWeight: '600', flexShrink: 1, marginLeft: 8 },
  errorEmoji: { fontSize: 40 },
  errorTitle: { fontWeight: '800', fontSize: 18, color: colors.primary, marginTop: 8, textAlign: 'center' },
  errorBody: { marginTop: 8, color: colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  planLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  planHours: { fontSize: 40, fontWeight: '800', color: '#FFFFFF', marginVertical: 4, letterSpacing: -1 },
  planSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  savingsBadge: { marginTop: 14, backgroundColor: 'rgba(232,161,60,0.18)', borderWidth: 1, borderColor: 'rgba(232,161,60,0.5)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 16 },
  savingsText: { fontWeight: '800', fontSize: 15, color: colors.amberSoft },
  extraTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  extraBody: { fontSize: 14, color: colors.textSecondary, marginTop: 2, lineHeight: 19 },
  whyTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  whyBody: { fontSize: 14, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
});
