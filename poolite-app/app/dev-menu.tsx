import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../src/components/PressableScale';
import { Card } from '../src/components/Card';
import { colors } from '../src/theme/colors';
import { useDevState } from '../src/state/DevStateContext';
import { usePoolProfile } from '../src/state/PoolProfileContext';
import { isSupabaseConfigured, isStripeConfigured } from '../src/lib/env';

function Row({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent }} />
    </View>
  );
}

export default function DevMenu() {
  const dev = useDevState();
  const profile = usePoolProfile();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Dev menu</Text>
        <Text style={styles.sub}>Solo per QA — forza gli stati alternativi senza aspettare le condizioni reali.</Text>

        <Card style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Backend</Text>
          <Text style={styles.statusLine}>Supabase: {isSupabaseConfigured ? '✅ collegato' : '⚠️ non configurato (modalità demo locale)'}</Text>
          <Text style={styles.statusLine}>Stripe: {isStripeConfigured ? '✅ collegato' : '⚠️ non configurato (checkout simulato)'}</Text>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle}>Stati alternativi</Text>
          <Row label="Errore rete" sub="Forza lo stato 'non riesco a leggere il meteo' su Oggi/Domani" value={dev.forceNetError} onChange={dev.setForceNetError} />
          <Row label="Acqua verde" sub="Forza punteggio rosso e urgenza nello Shop" value={dev.forceUrgentWater} onChange={dev.setForceUrgentWater} />
        </Card>

        <PressableScale
          onPress={() => {
            profile.restart();
            router.replace('/onboarding');
          }}
          style={styles.dangerBtn}
        >
          <Text style={styles.dangerText}>Reimposta onboarding e vai al primo step</Text>
        </PressableScale>

        <PressableScale onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>Chiudi</Text>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary, marginBottom: 8 },
  statusLine: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.background },
  rowLabel: { fontWeight: '700', fontSize: 14, color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  dangerBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder },
  dangerText: { color: colors.errorText, fontWeight: '700', fontSize: 14 },
  closeBtn: { marginTop: 12, alignItems: 'center', paddingVertical: 14 },
  closeText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
});
