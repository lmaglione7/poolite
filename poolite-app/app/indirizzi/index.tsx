import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { WaveDivider } from '../../src/components/WaveDivider';
import { PressableScale } from '../../src/components/PressableScale';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';
import { useAddresses, formatAddressLines } from '../../src/state/AddressContext';

export default function AddressListScreen() {
  // When opened from checkout (`?select=1`) tapping an address picks it and
  // goes back, instead of opening the editor.
  const { select } = useLocalSearchParams<{ select?: string }>();
  const selecting = select === '1';
  const { addresses, setDefault, remove } = useAddresses();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>{selecting ? 'Scegli l’indirizzo' : 'I tuoi indirizzi'}</Text>
        </View>
        <WaveDivider />

        {addresses.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 26 }}>
            <Text style={{ fontSize: 38 }}>📍</Text>
            <Text style={styles.emptyTitle}>Nessun indirizzo salvato</Text>
            <Text style={styles.emptyBody}>Aggiungine uno: ti servirà per ricevere i prodotti a casa.</Text>
          </Card>
        ) : (
          <View style={{ gap: 12 }}>
            {addresses.map((a) => (
              <PressableScale
                key={a.id}
                scaleTo={0.99}
                onPress={() => {
                  if (selecting) {
                    setDefault(a.id);
                    router.back();
                  } else {
                    router.push(`/indirizzi/${a.id}`);
                  }
                }}
              >
                <Card soft style={a.isDefault ? { borderColor: colors.accent, borderWidth: 2 } : undefined}>
                  <View style={styles.cardHeader}>
                    <View style={styles.labelPill}>
                      <Text style={styles.labelPillText}>{a.label}</Text>
                    </View>
                    {a.isDefault && (
                      <View style={styles.defaultPill}>
                        <Text style={styles.defaultPillText}>✓ Predefinito</Text>
                      </View>
                    )}
                  </View>
                  {formatAddressLines(a).map((line, i) => (
                    <Text key={i} style={i === 0 ? styles.addrName : styles.addrLine}>
                      {line}
                    </Text>
                  ))}
                  {!selecting && (
                    <View style={styles.actions}>
                      {!a.isDefault && (
                        <PressableScale onPress={() => setDefault(a.id)} style={styles.actionBtn}>
                          <Text style={styles.actionText}>Rendi predefinito</Text>
                        </PressableScale>
                      )}
                      <PressableScale onPress={() => router.push(`/indirizzi/${a.id}`)} style={styles.actionBtn}>
                        <Text style={styles.actionText}>Modifica</Text>
                      </PressableScale>
                      <PressableScale onPress={() => remove(a.id)} style={styles.actionBtn}>
                        <Text style={[styles.actionText, { color: colors.error }]}>Elimina</Text>
                      </PressableScale>
                    </View>
                  )}
                </Card>
              </PressableScale>
            ))}
          </View>
        )}

        <PrimaryButton label="+ Aggiungi indirizzo" onPress={() => router.push('/indirizzi/nuovo')} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingBottom: 60 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary },
  emptyTitle: { fontWeight: '800', fontSize: 16, color: colors.primary, marginTop: 8 },
  emptyBody: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  cardHeader: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  labelPill: { backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  labelPillText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  defaultPill: { backgroundColor: colors.amberBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  defaultPillText: { fontSize: 12, fontWeight: '800', color: colors.amber },
  addrName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  addrLine: { fontSize: 14, color: colors.textSecondary, marginTop: 2, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 8, alignItems: 'center', backgroundColor: colors.background },
  actionText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
