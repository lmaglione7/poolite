import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../../../src/components/PressableScale';
import { Card } from '../../../src/components/Card';
import { WaveDivider } from '../../../src/components/WaveDivider';
import { PrimaryButton } from '../../../src/components/PrimaryButton';
import { colors } from '../../../src/theme/colors';
import { TECHNICIANS, Technician } from '../../../src/data/technicians';
import { starString } from '../../../src/data/products';
import { supabase } from '../../../src/lib/supabase';
import { useAuth } from '../../../src/state/AuthContext';

export default function TecniciScreen() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Technician | null>(null);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  async function sendRequest() {
    if (!selected) return;
    if (supabase && user) {
      await supabase.from('service_requests').insert({
        user_id: user.id,
        technician_id: selected.id,
        message,
        phone,
      });
    }
    setSent(true);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <PressableScale scaleTo={0.93} onPress={() => (selected && !sent ? setSelected(null) : router.back())} style={styles.backBtn}>
              <Text style={styles.backChevron}>‹</Text>
            </PressableScale>
            <Text style={styles.title}>Tecnici di zona</Text>
          </View>
          <WaveDivider />

          {sent ? (
            <Card tone="selected" style={{ alignItems: 'center', paddingVertical: 26 }}>
              <Text style={{ fontSize: 42 }}>✅</Text>
              <Text style={styles.sentTitle}>Richiesta inviata!</Text>
              <Text style={styles.sentBody}>
                {selected?.name} ti ricontatta {selected?.respondsIn}. Tieni il telefono a portata di sdraio 🏖
              </Text>
              <PrimaryButton
                label="Torna al negozio"
                onPress={() => router.replace('/(tabs)/shop')}
                style={{ marginTop: 14, paddingHorizontal: 28 }}
              />
            </Card>
          ) : selected ? (
            <>
              <Card soft>
                <View style={styles.techHeader}>
                  <Text style={{ fontSize: 34 }}>{selected.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.techName}>{selected.name}</Text>
                    <Text style={styles.techSpecialty}>{selected.specialty}</Text>
                    <Text style={styles.techRating}>
                      <Text style={{ color: colors.accent }}>{starString(selected.rating)}</Text> {selected.rating.toFixed(1).replace('.', ',')} ·{' '}
                      {selected.reviewCount} recensioni verificate
                    </Text>
                  </View>
                </View>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}><Text style={styles.badgeText}>📍 {selected.zone}</Text></View>
                  <View style={styles.badge}><Text style={styles.badgeText}>⏱ risponde {selected.respondsIn}</Text></View>
                  <View style={styles.badge}><Text style={styles.badgeText}>🛠 {selected.yearsActive} anni di attività</Text></View>
                </View>
                <Text style={styles.servicesTitle}>Servizi</Text>
                {selected.services.map((s) => (
                  <Text key={s} style={styles.serviceItem}>• {s}</Text>
                ))}
              </Card>

              <Card soft style={{ marginTop: 12 }}>
                <Text style={styles.formTitle}>Richiedi un intervento</Text>
                <Text style={styles.formSub}>Descrivi il problema: i dati della tua piscina li alleghiamo noi.</Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Es: la pompa fa un rumore strano da ieri…"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]}
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Il tuo numero di telefono"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                <PrimaryButton label="Invia richiesta" onPress={sendRequest} disabled={!message.trim() || !phone.trim()} style={{ marginTop: 4 }} />
                <Text style={styles.formFootnote}>Gratis e senza impegno: decidi dopo il preventivo.</Text>
              </Card>
            </>
          ) : (
            <>
              <Text style={styles.introText}>
                Professionisti verificati vicino a te, con recensioni di altri proprietari Poolite. Richiesta gratuita, rispondono in giornata.
              </Text>
              <View style={{ gap: 12, marginTop: 12 }}>
                {TECHNICIANS.map((t) => (
                  <PressableScale key={t.id} scaleTo={0.98} onPress={() => setSelected(t)}>
                    <Card soft>
                      <View style={styles.techHeader}>
                        <Text style={{ fontSize: 30 }}>{t.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.techName} numberOfLines={1}>{t.name}</Text>
                          <Text style={styles.techSpecialty} numberOfLines={1}>{t.specialty}</Text>
                          <Text style={styles.techRating}>
                            <Text style={{ color: colors.accent }}>{starString(t.rating)}</Text> {t.rating.toFixed(1).replace('.', ',')} · {t.reviewCount}{' '}
                            recensioni · {t.zone}
                          </Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </View>
                    </Card>
                  </PressableScale>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  introText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, paddingHorizontal: 4 },
  techHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  techName: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  techSpecialty: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  techRating: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  chevron: { color: colors.accent, fontWeight: '800', fontSize: 18 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  badge: { backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  servicesTitle: { fontWeight: '800', fontSize: 14, color: colors.textPrimary, marginTop: 14 },
  serviceItem: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  formTitle: { fontWeight: '800', fontSize: 16, color: colors.textPrimary },
  formSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, fontSize: 15, backgroundColor: colors.background, color: colors.textPrimary, marginBottom: 10 },
  formFootnote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 10 },
  sentTitle: { fontWeight: '800', fontSize: 18, color: colors.primary, marginTop: 8 },
  sentBody: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
