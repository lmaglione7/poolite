import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '../../src/components/PressableScale';
import { ProductImage } from '../../src/components/ProductImage';
import { Card } from '../../src/components/Card';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';
import { useCatalog } from '../../src/hooks/useCatalog';
import { MANUALS_BY_PRODUCT } from '../../src/data/manuals';

// IKEA/LEGO-style booklet: one action per page, giant step number, short
// imperative text. Swipe-free by design — big Avanti/Indietro buttons.
export default function ManualScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId } = useCatalog();
  const product = byId[id ?? ''];
  const manual = MANUALS_BY_PRODUCT[id ?? ''];
  // page 0 = cover, 1..steps.length = steps, steps.length+1 = summary
  const [page, setPage] = useState(0);

  if (!product || !manual) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text style={{ padding: 20, color: colors.textSecondary }}>Manuale non disponibile per questo prodotto.</Text>
      </SafeAreaView>
    );
  }

  const totalPages = manual.steps.length + 2;
  const isCover = page === 0;
  const isSummary = page === totalPages - 1;
  const step = !isCover && !isSummary ? manual.steps[page - 1] : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topRow}>
        <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backChevron}>✕</Text>
        </PressableScale>
        <View style={styles.progressDots}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i <= page ? colors.primary : colors.border }]} />
          ))}
        </View>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isCover && (
          <View style={styles.coverWrap}>
            <ProductImage productId={product.id} imageUrl={product.imageUrl} width={160} height={160} radius={24} />
            <Text style={styles.coverKicker}>MANUALE PASSO-PASSO</Text>
            <Text style={styles.coverTitle}>{product.name}</Text>
            <Text style={styles.coverTagline}>{manual.tagline}</Text>
            <View style={styles.coverMetaRow}>
              <View style={styles.coverMetaPill}><Text style={styles.coverMetaText}>⏱ {manual.timeNeeded}</Text></View>
              <View style={styles.coverMetaPill}><Text style={styles.coverMetaText}>💪 {manual.difficulty}</Text></View>
              <View style={styles.coverMetaPill}><Text style={styles.coverMetaText}>👣 {manual.steps.length} passi</Text></View>
            </View>
            <Card soft style={{ marginTop: 18, alignSelf: 'stretch' }}>
              <Text style={styles.needTitle}>Ti serve solo:</Text>
              {manual.youNeed.map((n) => (
                <Text key={n} style={styles.needItem}>• {n}</Text>
              ))}
            </Card>
          </View>
        )}

        {step && (
          <View style={styles.stepWrap}>
            <Text style={styles.stepNumber}>{page}</Text>
            <Text style={styles.stepEmoji}>{step.emoji}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
            {step.warning && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ {step.warning}</Text>
              </View>
            )}
          </View>
        )}

        {isSummary && (
          <View>
            <Text style={styles.summaryTitle}>Riepilogo e sicurezza</Text>
            {manual.dosage && (
              <Card soft style={{ marginTop: 12 }}>
                <Text style={styles.dosageTitle}>📏 {manual.dosage.title}</Text>
                {manual.dosage.rows.map((r) => (
                  <View key={r.pool} style={styles.dosageRow}>
                    <Text style={styles.dosagePool}>{r.pool}</Text>
                    <Text style={styles.dosageDose}>{r.dose}</Text>
                  </View>
                ))}
              </Card>
            )}
            <Card tone="error" style={{ marginTop: 12 }}>
              <Text style={styles.safetyTitle}>🛑 Sicurezza, sempre</Text>
              {manual.safety.map((s) => (
                <Text key={s} style={styles.safetyItem}>• {s}</Text>
              ))}
            </Card>
            <Card tone="selected" style={{ marginTop: 12 }}>
              <Text style={styles.tipTitle}>💡 Il consiglio in più</Text>
              <Text style={styles.tipText}>{manual.proTip}</Text>
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={styles.navRow}>
        {page > 0 ? (
          <PressableScale onPress={() => setPage((p) => p - 1)} style={styles.navBtnSecondary}>
            <Text style={styles.navBtnSecondaryText}>‹ Indietro</Text>
          </PressableScale>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {isSummary ? (
          <PrimaryButton label="Fatto! 🎉" onPress={() => router.back()} style={{ flex: 1 }} />
        ) : (
          <PrimaryButton label={isCover ? 'Iniziamo ›' : 'Avanti ›'} onPress={() => setPage((p) => p + 1)} style={{ flex: 1 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  progressDots: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  content: { padding: 24, flexGrow: 1 },
  coverWrap: { alignItems: 'center' },
  coverKicker: { marginTop: 18, fontSize: 12, fontWeight: '800', color: colors.accent, letterSpacing: 1 },
  coverTitle: { fontSize: 24, fontWeight: '800', color: colors.primary, textAlign: 'center', marginTop: 4 },
  coverTagline: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 6 },
  coverMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  coverMetaPill: { backgroundColor: colors.selectedBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  coverMetaText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  needTitle: { fontWeight: '800', fontSize: 14, color: colors.textPrimary, marginBottom: 6 },
  needItem: { fontSize: 14, color: colors.textSecondary, marginTop: 3, lineHeight: 20 },
  stepWrap: { alignItems: 'center', paddingTop: 10 },
  stepNumber: { fontSize: 72, fontWeight: '800', color: colors.border, lineHeight: 76 },
  stepEmoji: { fontSize: 56, marginTop: 6 },
  stepTitle: { fontSize: 24, fontWeight: '800', color: colors.primary, textAlign: 'center', marginTop: 14 },
  stepText: { fontSize: 17, color: colors.textPrimary, textAlign: 'center', marginTop: 10, lineHeight: 26, maxWidth: 320 },
  warningBox: { marginTop: 18, backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: 16, padding: 14, maxWidth: 330 },
  warningText: { fontSize: 14, color: colors.errorText, fontWeight: '700', lineHeight: 20, textAlign: 'center' },
  summaryTitle: { fontSize: 22, fontWeight: '800', color: colors.primary },
  dosageTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary, marginBottom: 8 },
  dosageRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.background },
  dosagePool: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  dosageDose: { fontSize: 14, fontWeight: '800', color: colors.primary },
  safetyTitle: { fontWeight: '800', fontSize: 15, color: colors.errorText, marginBottom: 6 },
  safetyItem: { fontSize: 13, color: colors.errorText, marginTop: 4, lineHeight: 19 },
  tipTitle: { fontWeight: '800', fontSize: 15, color: colors.primary, marginBottom: 4 },
  tipText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  navRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, paddingBottom: 24, paddingTop: 8 },
  navBtnSecondary: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  navBtnSecondaryText: { fontWeight: '800', fontSize: 15, color: colors.primary },
});
