import { View, Text, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { WaveDivider } from '../src/components/WaveDivider';
import { PressableScale } from '../src/components/PressableScale';
import { colors } from '../src/theme/colors';
import { useSettings, LANGUAGES, COUNTRY, CURRENCY, LanguageCode } from '../src/state/SettingsContext';
import { useAuth } from '../src/state/AuthContext';
import { usePoolProfile } from '../src/state/PoolProfileContext';
import { PAYMENT_METHODS, CARRIERS } from '../src/data/commerce';
import { PaymentMark, PaymentMarks } from '../src/components/shop/PaymentMarks';

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  last,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent }} />
    </View>
  );
}

function LinkRow({ label, value, onPress, last }: { label: string; value?: string; onPress?: () => void; last?: boolean }) {
  return (
    <PressableScale haptic={false} onPress={onPress ?? (() => {})} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Text style={styles.chevron}>›</Text>}
    </PressableScale>
  );
}

export default function ImpostazioniScreen() {
  const settings = useSettings();
  const auth = useAuth();
  const profile = usePoolProfile();

  function pickLanguage(code: LanguageCode, ready: boolean) {
    if (!ready) {
      Alert.alert('In arrivo', 'Questa lingua sta per arrivare. Per ora Poolite parla italiano 🇮🇹');
      return;
    }
    settings.set('language', code);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>Impostazioni</Text>
        </View>
        <WaveDivider />

        <Text style={styles.sectionTitle}>Lingua e regione</Text>
        <Card soft style={styles.cardReset}>
          {LANGUAGES.map((l, i) => (
            <PressableScale
              key={l.code}
              haptic={false}
              onPress={() => pickLanguage(l.code, l.ready)}
              style={[styles.row, i === LANGUAGES.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={[styles.rowLabel, { flex: 1 }]}>
                {l.flag} {l.label}
                {!l.ready && <Text style={styles.soon}> · in arrivo</Text>}
              </Text>
              {settings.language === l.code && <Text style={styles.check}>✓</Text>}
            </PressableScale>
          ))}
        </Card>
        <Card soft style={[styles.cardReset, { marginTop: 10 }]}>
          <LinkRow label="Paese di spedizione" value={`${COUNTRY.flag} ${COUNTRY.label}`} />
          <LinkRow label="Valuta" value={CURRENCY.label} last />
        </Card>
        <Text style={styles.note}>Per ora spediamo e installiamo solo in Italia. Altri paesi arriveranno con i partner logistici giusti.</Text>

        <Text style={styles.sectionTitle}>Notifiche</Text>
        <Card soft style={styles.cardReset}>
          <ToggleRow
            label="Momento giusto per la pompa"
            sub="Una al giorno, quando inizia la fascia conveniente"
            value={settings.notifyPumpWindow}
            onChange={(v) => settings.set('notifyPumpWindow', v)}
          />
          <ToggleRow
            label="Domanda del giorno"
            sub="Il promemoria per le tue gocce 💧"
            value={settings.notifyDailyQuestion}
            onChange={(v) => settings.set('notifyDailyQuestion', v)}
          />
          <ToggleRow
            label="Scorte in arrivo"
            sub="3 giorni prima di ogni consegna automatica"
            value={settings.notifyRestock}
            onChange={(v) => settings.set('notifyRestock', v)}
          />
          <ToggleRow
            label="Offerte e sconti"
            sub="Solo se le vuoi. Mai più di una a settimana."
            value={settings.notifyOffers}
            onChange={(v) => settings.set('notifyOffers', v)}
            last
          />
        </Card>

        <Text style={styles.sectionTitle}>Privacy e dati</Text>
        <Card soft style={styles.cardReset}>
          <ToggleRow
            label="Confronti anonimi di zona"
            sub="I tuoi dati entrano nelle medie di zona, sempre in forma anonima"
            value={settings.zoneComparisonOptIn}
            onChange={(v) => settings.set('zoneComparisonOptIn', v)}
          />
          <ToggleRow
            label="Statistiche d'uso"
            sub="Ci aiutano a capire cosa migliorare. Nessun dato venduto, mai."
            value={settings.analyticsConsent}
            onChange={(v) => settings.set('analyticsConsent', v)}
          />
          <ToggleRow
            label="Email promozionali"
            sub="Novità e offerte via email"
            value={settings.marketingEmails}
            onChange={(v) => settings.set('marketingEmails', v)}
            last
          />
        </Card>

        <Text style={styles.sectionTitle}>Pagamenti accettati</Text>
        <Card soft style={styles.cardReset}>
          {PAYMENT_METHODS.map((p, i) => (
            <View key={p.id} style={[styles.row, i === PAYMENT_METHODS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{p.label}</Text>
                <Text style={styles.rowSub}>{p.hint}</Text>
              </View>
              <PaymentMark logoKey={p.logoKey} label={p.label} height={20} />
            </View>
          ))}
          <View style={{ padding: 16, paddingTop: 4 }}>
            <PaymentMarks showLabel={false} />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Spedizioni</Text>
        <Card soft style={styles.cardReset}>
          {CARRIERS.map((c, i) => (
            <View key={c.id} style={[styles.row, i === CARRIERS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{c.name}</Text>
                <Text style={styles.rowSub}>{c.eta}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Documenti</Text>
        <Card soft style={styles.cardReset}>
          <LinkRow label="Termini e condizioni" onPress={() => router.push('/legale/termini')} />
          <LinkRow label="Informativa privacy" onPress={() => router.push('/legale/privacy')} />
          <LinkRow label="I tuoi premi e coupon" onPress={() => router.push('/premi')} last />
        </Card>

        <Text style={styles.sectionTitle}>Account</Text>
        <Card soft style={styles.cardReset}>
          <LinkRow label="I miei ordini" onPress={() => router.push('/ordini')} />
          <LinkRow label="Indirizzi di spedizione" onPress={() => router.push('/indirizzi')} />
          <LinkRow label="Preferiti" onPress={() => router.push('/preferiti')} />
          <LinkRow label="Email" value={auth.user?.email ?? 'Modalità demo'} />
          <LinkRow
            label="Rifai le prime domande"
            onPress={() => {
              profile.restart();
              router.replace('/onboarding');
            }}
            last={!auth.user}
          />
          {auth.user && (
            <PressableScale
              haptic={false}
              onPress={async () => {
                await auth.signOut();
                router.replace('/(auth)/login');
              }}
              style={[styles.row, { borderBottomWidth: 0 }]}
            >
              <Text style={[styles.rowLabel, { color: colors.error }]}>Esci</Text>
            </PressableScale>
          )}
        </Card>

        <Text style={styles.version}>Poolite · versione 1.0.0 · fatto in Italia 🇮🇹</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  sectionTitle: { fontWeight: '800', fontSize: 13, color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 22, marginBottom: 8, paddingHorizontal: 4 },
  cardReset: { padding: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.background },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  rowValue: { fontSize: 14, color: colors.textSecondary, marginRight: 6 },
  chevron: { color: colors.accent, fontWeight: '800', fontSize: 18 },
  check: { color: colors.accent, fontWeight: '800', fontSize: 16 },
  soon: { color: colors.textSecondary, fontWeight: '400', fontSize: 13 },
  note: { fontSize: 12, color: colors.textSecondary, paddingHorizontal: 6, marginTop: 8, lineHeight: 17 },
  version: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 26 },
});
