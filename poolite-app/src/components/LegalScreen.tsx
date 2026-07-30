import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from './PressableScale';
import { WaveDivider } from './WaveDivider';
import { colors } from '../theme/colors';

export interface LegalSection {
  heading: string;
  body: string[];
}

// Shared chrome for Termini / Privacy. Text lives in the screens themselves.
export function LegalScreen({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>{title}</Text>
        </View>
        <WaveDivider />

        <View style={styles.draftBox}>
          <Text style={styles.draftText}>
            ⚖️ Bozza da far revisionare a un legale prima della pubblicazione sugli store. I dati societari tra parentesi quadre vanno completati.
          </Text>
        </View>

        <Text style={styles.updated}>Ultimo aggiornamento: {updated}</Text>
        <Text style={styles.intro}>{intro}</Text>

        {sections.map((s, i) => (
          <View key={s.heading} style={{ marginTop: 20 }}>
            <Text style={styles.heading}>
              {i + 1}. {s.heading}
            </Text>
            {s.body.map((p, j) => (
              <Text key={j} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary, flex: 1 },
  draftBox: { backgroundColor: colors.amberBg, borderWidth: 1, borderColor: colors.amberBorder, borderRadius: 14, padding: 12 },
  draftText: { fontSize: 12, color: colors.textPrimary, lineHeight: 18 },
  updated: { fontSize: 12, color: colors.textSecondary, marginTop: 14 },
  intro: { fontSize: 15, color: colors.textPrimary, lineHeight: 23, marginTop: 10 },
  heading: { fontSize: 16, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  paragraph: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginTop: 6 },
});
