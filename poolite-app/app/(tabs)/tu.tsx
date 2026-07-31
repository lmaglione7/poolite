import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TabScreen } from '../../src/components/TabScreen';
import { WaveDivider } from '../../src/components/WaveDivider';
import { Card } from '../../src/components/Card';
import { PressableScale } from '../../src/components/PressableScale';
import { colors } from '../../src/theme/colors';
import { usePoolProfile } from '../../src/state/PoolProfileContext';
import { useAuth } from '../../src/state/AuthContext';
import { useSubscriptions } from '../../src/state/SubscriptionsContext';
import { useRewards, REFERRAL_REWARD } from '../../src/state/RewardsContext';
import { useOrders } from '../../src/state/OrdersContext';
import { useWishlist } from '../../src/state/WishlistContext';
import { useCatalog } from '../../src/hooks/useCatalog';
import { useWeatherCost } from '../../src/hooks/useWeatherCost';
import { useWaterState } from '../../src/hooks/useWaterState';
import { getZoneStats } from '../../src/lib/zoneStats';
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
  const subs = useSubscriptions();
  const rewards = useRewards();
  const orders = useOrders();
  const wishlist = useWishlist();
  const { products, byId } = useCatalog();
  const { today, cityName } = useWeatherCost();
  const { score } = useWaterState();
  const dealsCount = products.filter((p) => p.old).length;
  const know = knowPercent(profile);
  const firstDay = profile.daysSinceOnboarding === 0;
  const zone = getZoneStats(cityName, today?.cost.costToday ?? 2.4, score);
  const activeSubs = subs.subscriptions.filter((s) => !s.paused);

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
        <PressableScale scaleTo={0.93} onPress={() => router.push('/impostazioni')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </PressableScale>
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
        <PressableScale haptic={false} onPress={() => router.push('/report')}>
          <Text style={styles.reportLink}>Vedi il report della settimana ›</Text>
        </PressableScale>
      </Card>

      <Card soft style={{ marginTop: 12 }}>
        <Text style={styles.zoneHeader}>La tua zona · {zone.city}</Text>
        <View style={styles.zoneRow}>
          <View style={styles.zoneStat}>
            <Text style={styles.zoneStatValue}>{zone.costPercentile}%</Text>
            <Text style={styles.zoneStatLabel}>piscine battute sul costo</Text>
          </View>
          <View style={styles.zoneStat}>
            <Text style={styles.zoneStatValue}>{formatEuro(zone.avgDailyCost)}</Text>
            <Text style={styles.zoneStatLabel}>spesa media di zona/giorno</Text>
          </View>
          <View style={styles.zoneStat}>
            <Text style={[styles.zoneStatValue, { color: score >= zone.avgWaterScore ? colors.accent : colors.amber }]}>
              {score} vs {zone.avgWaterScore}
            </Text>
            <Text style={styles.zoneStatLabel}>punteggio acqua vs media</Text>
          </View>
        </View>
        <Text style={styles.zoneFootnote}>Confronto anonimo con {zone.poolsInZone} piscine simili alla tua in zona</Text>
      </Card>

      <PressableScale scaleTo={0.98} onPress={() => router.push('/(tabs)/shop/scorte')}>
        <Card soft style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <Text style={{ fontSize: 26 }}>📦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dealsTitle}>Le tue scorte automatiche</Text>
            <Text style={styles.dealsSub}>
              {activeSubs.length === 0
                ? 'Nessuna attiva — risparmi il 10% su ogni scorta'
                : `${activeSubs.length} attiv${activeSubs.length === 1 ? 'a' : 'e'} · prossima: ${byId[activeSubs[0].productId]?.name ?? ''}`}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      </PressableScale>

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

      <View style={styles.quickRow}>
        {[
          { icon: '📦', label: 'I miei ordini', href: '/ordini', badge: orders.orders.length || undefined },
          { icon: '🤍', label: 'Preferiti', href: '/preferiti', badge: wishlist.count || undefined },
          { icon: '📍', label: 'Indirizzi', href: '/indirizzi', badge: undefined },
        ].map((q) => (
          <PressableScale key={q.href} scaleTo={0.96} onPress={() => router.push(q.href as any)} style={styles.quickCard}>
            <Text style={{ fontSize: 22 }}>{q.icon}</Text>
            <Text style={styles.quickLabel}>{q.label}</Text>
            {q.badge ? (
              <View style={styles.quickBadge}>
                <Text style={styles.quickBadgeText}>{q.badge}</Text>
              </View>
            ) : null}
          </PressableScale>
        ))}
      </View>

      <PressableScale scaleTo={0.98} onPress={() => router.push('/premi')}>
        <Card tone="amber" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
          <Text style={{ fontSize: 26 }}>🎁</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dealsTitle}>I tuoi premi e coupon</Text>
            <Text style={styles.dealsSub}>
              {rewards.availableCoupons.length > 0
                ? `${rewards.availableCoupons.length} coupon pronti da usare`
                : `Invita un amico: ${REFERRAL_REWARD} € di sconto per te`}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      </PressableScale>

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
  settingsBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 17 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quickCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 14, alignItems: 'center', gap: 5 },
  quickLabel: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  quickBadge: { position: 'absolute', top: 8, right: 10, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  quickBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  piggyLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '700' },
  piggyAmount: { fontSize: 54, fontWeight: '800', color: colors.amber, letterSpacing: -2, marginVertical: 4 },
  piggySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  reportLink: { marginTop: 10, fontSize: 13, color: colors.accent, fontWeight: '700' },
  zoneHeader: { fontWeight: '800', fontSize: 15, color: colors.textPrimary, marginBottom: 12 },
  zoneRow: { flexDirection: 'row', gap: 8 },
  zoneStat: { flex: 1, alignItems: 'center' },
  zoneStatValue: { fontSize: 16, fontWeight: '800', color: colors.accent, textAlign: 'center' },
  zoneStatLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 3, lineHeight: 14 },
  zoneFootnote: { fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 12 },
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
