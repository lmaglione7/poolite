import { View, Text, StyleSheet } from 'react-native';
import { TabScreen } from '../../src/components/TabScreen';
import { WaveDivider } from '../../src/components/WaveDivider';
import { Card } from '../../src/components/Card';
import { ScoreGauge } from '../../src/components/ScoreGauge';
import { PressableScale } from '../../src/components/PressableScale';
import { DealHookCard } from '../../src/components/shop/DealHookCard';
import { colors } from '../../src/theme/colors';
import { usePoolProfile } from '../../src/state/PoolProfileContext';
import { useWaterState } from '../../src/hooks/useWaterState';
import { useWaterLog } from '../../src/hooks/useWaterLog';
import { useCatalog } from '../../src/hooks/useCatalog';
import { formatRelativeItalian } from '../../src/lib/relativeTime';

const WATER_OPTIONS: { id: 'azzurra' | 'torbida' | 'verdina'; emoji: string; label: string }[] = [
  { id: 'azzurra', emoji: '💙', label: 'Azzurra' },
  { id: 'torbida', emoji: '😶‍🌫️', label: 'Torbida' },
  { id: 'verdina', emoji: '🟢', label: 'Verdina' },
];

const CHIPS = [
  { name: 'Cloro', emoji: '🧴' },
  { name: 'pH+', emoji: '🧪' },
  { name: 'pH−', emoji: '⚗️' },
  { name: 'Antialghe', emoji: '🌿' },
  { name: 'Flocculante', emoji: '✨' },
];

export default function AcquaTab() {
  const profile = usePoolProfile();
  const { urgent, cloudy, score, scoreColor, scoreLabel, scoreHint } = useWaterState();
  const { answer, logTreatment } = useWaterLog();
  const { byId } = useCatalog();

  const dealProduct = urgent ? byId.shock : cloudy ? byId.floc : byId.robot;
  const dealLabel = urgent ? 'Serve adesso, e oggi costa meno:' : cloudy ? 'Per l’acqua torbida, in offerta oggi:' : 'In offerta per la tua piscina:';

  return (
    <TabScreen>
      <View style={styles.headerRow}>
        <Text style={styles.title}>La tua acqua</Text>
        <Text style={styles.meta}>💧 {profile.gocce} gocce</Text>
      </View>
      <WaveDivider />

      <View style={styles.gaugeWrap}>
        <ScoreGauge score={score} color={scoreColor} />
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
        <Text style={styles.scoreHint}>{scoreHint}</Text>
      </View>

      {profile.answeredToday ? (
        <Card tone="selected" style={{ alignItems: 'center', marginTop: 16 }}>
          <Text style={styles.doneTitle}>Fatto! +10 gocce 💧</Text>
          <Text style={styles.doneSub}>Domani un’altra domanda ti aspetta.</Text>
        </Card>
      ) : (
        <Card style={{ marginTop: 16 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.qTitle}>La domanda del giorno</Text>
            <View style={styles.qBadge}>
              <Text style={styles.qBadgeText}>+10 gocce 💧</Text>
            </View>
          </View>
          <Text style={styles.qBody}>Di che colore è l’acqua oggi?</Text>
          <View style={styles.qRow}>
            {WATER_OPTIONS.map((o) => (
              <PressableScale key={o.id} scaleTo={0.95} onPress={() => answer(o.id)} style={styles.qOption}>
                <Text style={styles.qEmoji}>{o.emoji}</Text>
                <Text style={styles.qLabel}>{o.label}</Text>
              </PressableScale>
            ))}
          </View>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Diario trattamenti</Text>
      <Text style={styles.sectionSub}>Hai messo qualcosa in acqua? Un tap e me lo ricordo io.</Text>
      <View style={styles.chipsRow}>
        {CHIPS.map((c) => (
          <PressableScale key={c.name} scaleTo={0.94} onPress={() => logTreatment(c.name, c.emoji)} style={styles.chip}>
            <Text style={styles.chipText}>
              {c.emoji} {c.name}
            </Text>
          </PressableScale>
        ))}
      </View>

      <Card style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
        {profile.treatmentLogs.slice(0, 4).map((lg, i) => (
          <View key={lg.id} style={[styles.logRow, i === Math.min(3, profile.treatmentLogs.length - 1) && { borderBottomWidth: 0 }]}>
            <Text style={styles.logName}>
              {lg.emoji} {lg.name}
            </Text>
            <Text style={styles.logWhen}>{formatRelativeItalian(lg.whenISO)}</Text>
          </View>
        ))}
      </Card>

      {dealProduct && <DealHookCard product={dealProduct} label={dealLabel} />}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4, paddingTop: 6 },
  title: { fontSize: 24, fontWeight: '800', color: colors.primary },
  meta: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  gaugeWrap: { alignItems: 'center', paddingVertical: 6 },
  scoreLabel: { marginTop: 10, fontWeight: '800', fontSize: 16 },
  scoreHint: { fontSize: 13, color: colors.textSecondary, marginTop: 2, textAlign: 'center', maxWidth: 280 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doneTitle: { fontWeight: '800', fontSize: 16, color: colors.primary },
  doneSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  qTitle: { fontWeight: '800', fontSize: 16, color: colors.textPrimary },
  qBadge: { backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  qBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  qBody: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  qRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  qOption: { flex: 1, backgroundColor: colors.background, borderWidth: 2, borderColor: colors.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  qEmoji: { fontSize: 24 },
  qLabel: { fontWeight: '700', fontSize: 13, color: colors.textPrimary, marginTop: 4 },
  sectionTitle: { marginTop: 18, paddingHorizontal: 4, fontWeight: '800', fontSize: 16, color: colors.textPrimary },
  sectionSub: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 4, paddingVertical: 2, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  chipText: { fontWeight: '700', fontSize: 14, color: colors.primary },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.background },
  logName: { fontWeight: '700', fontSize: 15, color: colors.textPrimary },
  logWhen: { fontSize: 13, color: colors.textSecondary },
});
