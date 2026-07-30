import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TabScreen } from '../../src/components/TabScreen';
import { WaveDivider } from '../../src/components/WaveDivider';
import { Card } from '../../src/components/Card';
import { PressableScale } from '../../src/components/PressableScale';
import { colors } from '../../src/theme/colors';
import { usePoolProfile } from '../../src/state/PoolProfileContext';
import { useAuth } from '../../src/state/AuthContext';
import { useCatalog } from '../../src/hooks/useCatalog';
import { formatEuro } from '../../src/data/products';

function knowPercent(profile: ReturnType<typeof usePoolProfile>): number {
  let pct = 40;
  if (profile.size) pct += 10;
  if (profile.pump) pct += 10;
  if (profile.city) pct += 5;
  if (profile.treatment) pct += 5;
  if (profile.answeredToday) pct += 10;
  pct += Math.min(20, profile.treatmentLogs.length * 2);
  return Math.min(99, pct);
}

const SIZE_LABELS: Record<string, string> = {
  S: 'Piccola (~10 m³)',
  M: 'Media (~25 m³)',
  L: 'Grande (~45 m³)',
  XL: 'Grandissima (60+ m³)',
};

export default function TuTab() {
  const profile = usePoolProfile();
  const auth = useAuth();
  const { products } = useCatalog();
  const dealsCount = products.filter((p) => p.old).length;
  const know = knowPercent(profile);
  const firstDay = profile.daysSinceOnboarding === 0;

  const sizeLabel =
    profile.size === 'custom'
      ? `${profile.dims.l || '?'} × ${profile.dims.w || '?'} × ${profile.dims.d || '?'} m`
      : (profile.size && SIZE_LABELS[profile.size]) || 'Media (~25 m³)';

  const poolData = [
    { k: 'Dimensione', v: sizeLabel },
    { k: 'Pompa', v: profile.pump === 'boh' || !profile.pump ? '1 HP (stimata)' : `${profile.pump} HP` },
    { k: 'Città', v: profile.city ?? 'Monza' },
    { k: 'Trattamento', v: { cloro: 'Cloro', sale: 'Sale', boh: 'Da scoprire' }[profile.treatment ?? 'cloro'] ?? 'Cloro' },
  ];

  return (
    <TabScreen>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Ciao 👋</Text>
        <Text style={styles.meta}>{profile.city ?? 'Monza'}</Text>
      </View>
      <WaveDivider />

      <Card tone="amber" style={{ alignItems: 'center' }}>
        <Text style={styles.piggyLabel}>IL TUO SALVADANAIO 🐷</Text>
        <Text style={styles.piggyAmount}>{formatEuro(profile.cumulativeSavings)}</Text>
        <Text style={styles.piggySub}>
          {firstDay
            ? 'Il salvadanaio parte oggi 🌱 Da domani vedrai qui gli euro che ti faccio risparmiare.'
            : `risparmiati in ${profile.daysSinceOnboarding} giorni, senza fare niente`}
        </Text>
      </Card>

      <View style={styles.statsRow}>
        <Card soft style={styles.statCard}>
          <Text style={{ fontSize: 24 }}>💧</Text>
          <Text style={styles.statValue}>{profile.gocce}</Text>
          <Text style={styles.statLabel}>gocce</Text>
        </Card>
        <Card soft style={styles.statCard}>
          <Text style={{ fontSize: 24 }}>🔥</Text>
          <Text style={styles.statValue}>{profile.streak}</Text>
          <Text style={styles.statLabel}>giorni di fila</Text>
        </Card>
      </View>

      <PressableScale scaleTo={0.98} onPress={() => router.push('/(tabs)/shop')}>
        <Card tone="amber" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <Text style={{ fontSize: 26 }}>🏷</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dealsTitle}>I tuoi sconti esclusivi</Text>
            <Text style={styles.dealsSub}>
              {dealsCount} offerte del giorno attive per te, fino a <Text style={{ fontWeight: '800', color: colors.amber }}>−25%</Text>
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      </PressableScale>

      <Card style={{ marginTop: 12 }}>
        <Text style={styles.knowTitle}>Poolite ti conosce al {know}%</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${know}%` }]} />
        </View>
        <PressableScale haptic={false} onPress={() => router.push('/(tabs)/acqua')}>
          <Text style={styles.knowLink}>Rispondi alla domanda del giorno per conoscerci meglio ›</Text>
        </PressableScale>
      </Card>

      <Card style={{ marginTop: 12, padding: 0, overflow: 'hidden' }}>
        <Text style={styles.poolHeader}>La tua piscina</Text>
        {poolData.map((pd) => (
          <View key={pd.k} style={styles.poolRow}>
            <Text style={styles.poolKey}>{pd.k}</Text>
            <Text style={styles.poolValue}>{pd.v}</Text>
          </View>
        ))}
        <PressableScale
          haptic={false}
          onPress={() => {
            profile.restart();
            router.replace('/onboarding');
          }}
          style={{ padding: 18 }}
        >
          <Text style={styles.restartLink}>Rifai le prime domande ›</Text>
        </PressableScale>
      </Card>

      {auth.configured && auth.user && (
        <PressableScale
          haptic={false}
          onPress={async () => {
            await auth.signOut();
            router.replace('/(auth)/login');
          }}
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={styles.signOut}>Esci</Text>
        </PressableScale>
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4, paddingTop: 6 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  meta: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  piggyLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  piggyAmount: { fontSize: 54, fontWeight: '800', color: colors.amber, letterSpacing: -2, marginVertical: 4 },
  piggySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  dealsTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  dealsSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  chevron: { color: colors.accent, fontWeight: '800', fontSize: 18 },
  knowTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  progressTrack: { marginTop: 10, height: 8, borderRadius: 4, backgroundColor: colors.selectedBg, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  knowLink: { marginTop: 10, fontSize: 13, color: colors.accent, fontWeight: '700' },
  poolHeader: { padding: 18, paddingBottom: 14, fontWeight: '800', fontSize: 15, color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.background },
  poolRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.background },
  poolKey: { fontSize: 14, color: colors.textSecondary },
  poolValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  restartLink: { fontSize: 14, color: colors.accent, fontWeight: '700' },
  signOut: { fontSize: 14, color: colors.error, fontWeight: '700' },
});
