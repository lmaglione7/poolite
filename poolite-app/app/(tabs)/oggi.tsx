import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TabScreen } from '../../src/components/TabScreen';
import { WaveDivider } from '../../src/components/WaveDivider';
import { HeroBanner } from '../../src/components/HeroBanner';
import { Card } from '../../src/components/Card';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { DealCardCompact } from '../../src/components/shop/DealCardCompact';
import { colors } from '../../src/theme/colors';
import { usePoolProfile } from '../../src/state/PoolProfileContext';
import { useWeatherCost } from '../../src/hooks/useWeatherCost';
import { useCatalog } from '../../src/hooks/useCatalog';
import { formatEuro } from '../../src/data/products';

export default function OggiTab() {
  const profile = usePoolProfile();
  const { loading, netError, today, cityName, retry } = useWeatherCost();
  const { products } = useCatalog();
  const deals = products.filter((p) => p.old);

  useEffect(() => {
    if (today) profile.addSavings(today.cost.savingsToday);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today?.cost.savingsToday]);

  return (
    <TabScreen onRefresh={retry} refreshing={loading}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Oggi</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {cityName} · oggi max {today ? `${today.tempMax} °C` : '…'} ☀️
        </Text>
      </View>
      <WaveDivider />
      <HeroBanner />

      {netError ? (
        <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
          <Text style={styles.errorEmoji}>🌥</Text>
          <Text style={styles.errorTitle}>Non riesco a leggere il meteo</Text>
          <Text style={styles.errorBody}>Capita, nessun problema. Controlla la connessione quando puoi: intanto valgono i consigli di ieri.</Text>
          <PrimaryButton label="Riprova" onPress={retry} style={{ marginTop: 16, paddingHorizontal: 30, alignSelf: 'center' }} />
        </Card>
      ) : today ? (
        <>
          <View style={styles.heroCostWrap}>
            <Text style={styles.heroLabel}>Oggi la piscina ti costa</Text>
            <Text style={styles.heroPrice}>{formatEuro(today.cost.costToday)}</Text>
            <Text style={styles.heroLabel}>con {today.cost.hours} ore di pompa, non una di più</Text>
          </View>

          <Card tone="primary" style={{ marginTop: 14 }}>
            <Text style={styles.momentLabel}>IL MOMENTO GIUSTO</Text>
            <Text style={styles.momentHours}>{today.hourRange}</Text>
            <Text style={styles.momentSub}>accendi la pompa qui</Text>
            <Text style={styles.momentFoot}>☀️ Il sole scalda e la corrente costa meno: due piccioni.</Text>
          </Card>

          <Card soft style={{ marginTop: 12 }}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.compareTitle}>Se andasse come fanno tutti</Text>
                <Text style={styles.compareSub}>pompa accesa 12 ore fisse</Text>
              </View>
              <Text style={styles.strikePrice}>{formatEuro(today.cost.costEveryone)}</Text>
            </View>
            <View style={styles.savingsPill}>
              <Text style={styles.savingsLabel}>Oggi risparmi</Text>
              <Text style={styles.savingsValue}>{formatEuro(today.cost.savingsToday)}</Text>
            </View>
          </Card>

          <Card soft style={{ marginTop: 12 }}>
            <Text style={styles.compareTitle}>Così, a fine mese</Text>
            <View style={[styles.rowBetween, { marginTop: 6, alignItems: 'baseline' }]}>
              <Text style={styles.monthSub}>
                circa {formatEuro(today.cost.monthlyCost)} invece di {formatEuro(today.cost.monthlyCostEveryone)}
              </Text>
              <Text style={styles.monthSavings}>− {formatEuro(today.cost.monthlySavings).replace(' €', '')} €</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, Math.round((today.cost.monthlySavings / Math.max(1, today.cost.monthlyCostEveryone)) * 100))}%` },
                ]}
              />
            </View>
          </Card>
        </>
      ) : null}

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Offerte del giorno</Text>
        <Text onPress={() => router.push('/(tabs)/shop')} style={styles.sectionLink}>
          Vedi tutte ›
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsRow}>
        {deals.map((p) => (
          <DealCardCompact key={p.id} product={p} />
        ))}
      </ScrollView>
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
  heroCostWrap: { alignItems: 'center', paddingVertical: 8 },
  heroLabel: { fontSize: 15, color: colors.textSecondary },
  heroPrice: { fontSize: 68, fontWeight: '800', color: colors.primary, letterSpacing: -2, marginVertical: 2 },
  momentLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  momentHours: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  momentSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  momentFoot: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compareTitle: { fontWeight: '700', fontSize: 15, color: colors.textPrimary },
  compareSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  strikePrice: { fontSize: 22, fontWeight: '800', color: colors.textSecondary, textDecorationLine: 'line-through' },
  savingsPill: { marginTop: 12, backgroundColor: colors.amberBg, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savingsLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  savingsValue: { fontSize: 20, fontWeight: '800', color: colors.amber },
  monthSub: { fontSize: 14, color: colors.textSecondary },
  monthSavings: { fontSize: 18, fontWeight: '800', color: colors.amber },
  progressTrack: { marginTop: 10, height: 8, borderRadius: 4, backgroundColor: colors.selectedBg, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 20, paddingHorizontal: 4 },
  sectionTitle: { fontWeight: '800', fontSize: 16, color: colors.textPrimary },
  sectionLink: { fontSize: 13, color: colors.accent, fontWeight: '700' },
  dealsRow: { gap: 10, paddingVertical: 10, paddingHorizontal: 2 },
});
