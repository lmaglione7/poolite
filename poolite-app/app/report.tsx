import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { WaveDivider } from '../src/components/WaveDivider';
import { PressableScale } from '../src/components/PressableScale';
import { colors } from '../src/theme/colors';
import { usePoolProfile } from '../src/state/PoolProfileContext';
import { useWeatherCost } from '../src/hooks/useWeatherCost';
import { useWaterState } from '../src/hooks/useWaterState';
import { getZoneStats } from '../src/lib/zoneStats';
import { formatEuro } from '../src/data/products';

function weekBounds(offsetWeeks = 0): { start: string; end: string } {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day - offsetWeeks * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
}

export default function WeeklyReport() {
  const profile = usePoolProfile();
  const { today, cityName } = useWeatherCost();
  const { score } = useWaterState();

  const thisWeek = weekBounds(0);
  const lastWeek = weekBounds(1);
  const sumIn = (b: { start: string; end: string }) =>
    profile.savingsHistory.filter((d) => d.dateISO >= b.start && d.dateISO <= b.end).reduce((a, d) => a + d.amount, 0);

  const weekSavings = sumIn(thisWeek);
  const prevWeekSavings = sumIn(lastWeek);
  const daysTracked = profile.savingsHistory.filter((d) => d.dateISO >= thisWeek.start && d.dateISO <= thisWeek.end).length;
  const best = profile.savingsHistory
    .filter((d) => d.dateISO >= thisWeek.start && d.dateISO <= thisWeek.end)
    .sort((a, b) => b.amount - a.amount)[0];

  const zone = getZoneStats(cityName, today?.cost.costToday ?? 2.4, score);
  const delta = weekSavings - prevWeekSavings;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>Il report della settimana</Text>
        <Text style={styles.subtitle}>Solo numeri veri, promesso.</Text>
        <WaveDivider />

        <Card tone="amber" style={{ alignItems: 'center' }}>
          <Text style={styles.heroLabel}>QUESTA SETTIMANA HAI RISPARMIATO</Text>
          <Text style={styles.heroAmount}>{formatEuro(weekSavings)}</Text>
          <Text style={styles.heroSub}>
            {daysTracked > 0 ? `in ${daysTracked} ${daysTracked === 1 ? 'giorno' : 'giorni'} seguendo i consigli` : 'Apri l’app ogni giorno per accumulare qui i risparmi'}
          </Text>
        </Card>

        <Card soft style={{ marginTop: 12 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.statLabel}>Vs settimana scorsa</Text>
            <Text style={[styles.statValue, { color: delta >= 0 ? colors.accent : colors.textSecondary }]}>
              {delta >= 0 ? '+' : '−'} {formatEuro(Math.abs(delta))}
            </Text>
          </View>
          {best && (
            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Text style={styles.statLabel}>Giorno migliore</Text>
              <Text style={styles.statValue}>{formatEuro(best.amount)}</Text>
            </View>
          )}
          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <Text style={styles.statLabel}>Totale da sempre</Text>
            <Text style={[styles.statValue, { color: colors.amber }]}>{formatEuro(profile.cumulativeSavings)}</Text>
          </View>
        </Card>

        <Card soft style={{ marginTop: 12 }}>
          <View style={styles.row}>
            <Text style={{ fontSize: 22 }}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneTitle}>
                Meglio del <Text style={{ color: colors.accent }}>{zone.costPercentile}%</Text> delle piscine come la tua a {zone.city}
              </Text>
              <Text style={styles.zoneSub}>media di zona {formatEuro(zone.avgDailyCost)}/giorno · {zone.poolsInZone} piscine confrontate, in anonimo</Text>
            </View>
          </View>
        </Card>

        <PressableScale onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>Chiudi</Text>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  heroLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 0.5 },
  heroAmount: { fontSize: 52, fontWeight: '800', color: colors.amber, letterSpacing: -2, marginVertical: 4 },
  heroSub: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  statLabel: { fontSize: 14, color: colors.textSecondary },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  zoneTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  zoneSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  closeBtn: { marginTop: 20, alignItems: 'center', paddingVertical: 12 },
  closeText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
});
