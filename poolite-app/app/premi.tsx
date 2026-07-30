import { View, Text, ScrollView, StyleSheet, Share, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { WaveDivider } from '../src/components/WaveDivider';
import { PressableScale } from '../src/components/PressableScale';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors } from '../src/theme/colors';
import { useRewards, LOYALTY_TIERS, REFERRAL_REWARD } from '../src/state/RewardsContext';
import { formatEuro } from '../src/data/products';

export default function PremiScreen() {
  const rewards = useRewards();

  async function shareInvite() {
    const message = `Ti regalo Poolite: l'app che ti dice quanto ti costa la piscina ogni giorno e come spendere meno. Iscriviti col mio link e ci becchiamo tutti e due uno sconto 👉 ${rewards.referralLink}`;
    if (Platform.OS === 'web') {
      // Web preview has no native share sheet.
      return;
    }
    await Share.share({ message });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.topRow}>
          <PressableScale scaleTo={0.93} onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>‹</Text>
          </PressableScale>
          <Text style={styles.title}>I tuoi premi</Text>
        </View>
        <WaveDivider />

        <Card tone="amber">
          <Text style={styles.sectionKicker}>INVITA UN AMICO</Text>
          <Text style={styles.referralAmount}>{REFERRAL_REWARD} € per te</Text>
          <Text style={styles.referralSub}>
            Ogni amico che si iscrive col tuo link ti regala {REFERRAL_REWARD} € di sconto sul prossimo ordine. Nessun limite, nessuna scadenza.
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Il tuo codice</Text>
            <Text style={styles.codeValue}>{rewards.referralCode}</Text>
          </View>
          <PrimaryButton label="Invita un amico" onPress={shareInvite} style={{ marginTop: 12 }} />
          <Text style={styles.referralCount}>
            {rewards.referredFriends === 0
              ? 'Nessun amico iscritto ancora'
              : `${rewards.referredFriends} amic${rewards.referredFriends === 1 ? 'o iscritto' : 'i iscritti'} · ${formatEuro(rewards.referredFriends * REFERRAL_REWARD)} guadagnati`}
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Coupon disponibili</Text>
        {rewards.availableCoupons.length === 0 ? (
          <Card soft style={{ marginTop: 10 }}>
            <Text style={styles.emptyText}>
              Nessun coupon attivo. Il primo arriva già al tuo primo ordine 🎁
            </Text>
          </Card>
        ) : (
          <View style={{ gap: 10, marginTop: 10 }}>
            {rewards.availableCoupons.map((c) => (
              <Card key={c.code} tone="amber">
                <View style={styles.couponRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.couponLabel}>{c.label}</Text>
                    <Text style={styles.couponReason}>{c.reason}</Text>
                    <Text style={styles.couponMin}>
                      {c.minSpend > 0 ? `Spesa minima ${formatEuro(c.minSpend)}` : 'Nessuna spesa minima'}
                    </Text>
                  </View>
                  <View style={styles.couponAmountBox}>
                    <Text style={styles.couponAmount}>−{c.amount}€</Text>
                  </View>
                </View>
                <View style={styles.couponCodeStrip}>
                  <Text style={styles.couponCode}>{c.code}</Text>
                  <Text style={styles.couponAuto}>si applica da solo al carrello</Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>La scala fedeltà</Text>
        <Text style={styles.sectionSub}>Più ordini fai, più sconti sblocchi. Semplice, senza giochi.</Text>
        <Card soft style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
          {LOYALTY_TIERS.map((t, i) => {
            const unlocked = rewards.orderCount >= t.orders;
            return (
              <View key={t.orders} style={[styles.tierRow, i === LOYALTY_TIERS.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.tierBadge, { backgroundColor: unlocked ? colors.accent : colors.border }]}>
                  <Text style={styles.tierBadgeText}>{t.orders}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierLabel, unlocked && { color: colors.primary }]}>{t.label}</Text>
                  <Text style={styles.tierDetail}>
                    {t.orders} ordini · spesa minima {formatEuro(t.minSpend)}
                  </Text>
                </View>
                <Text style={[styles.tierAmount, { color: unlocked ? colors.amber : colors.textSecondary }]}>−{t.amount}€</Text>
              </View>
            );
          })}
        </Card>
        {rewards.nextTier && (
          <Text style={styles.nextTierNote}>
            Ancora {rewards.nextTier.orders - rewards.orderCount} ordin{rewards.nextTier.orders - rewards.orderCount === 1 ? 'e' : 'i'} e sblocchi{' '}
            <Text style={{ fontWeight: '800', color: colors.amber }}>−{rewards.nextTier.amount} €</Text>
          </Text>
        )}
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
  sectionKicker: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.8 },
  referralAmount: { fontSize: 40, fontWeight: '800', color: colors.amber, letterSpacing: -1.5, marginTop: 2 },
  referralSub: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginTop: 4 },
  codeBox: { marginTop: 14, backgroundColor: colors.background, borderRadius: 14, borderWidth: 1, borderColor: colors.amberBorder, borderStyle: 'dashed', paddingVertical: 12, alignItems: 'center' },
  codeLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '700' },
  codeValue: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: 2, marginTop: 2 },
  referralCount: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 10 },
  sectionTitle: { fontWeight: '800', fontSize: 17, color: colors.textPrimary, marginTop: 22, paddingHorizontal: 4 },
  sectionSub: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 4, marginTop: 2 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  couponLabel: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  couponReason: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  couponMin: { fontSize: 12, color: colors.accent, fontWeight: '700', marginTop: 3 },
  couponAmountBox: { backgroundColor: colors.amberBg, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  couponAmount: { fontSize: 20, fontWeight: '800', color: colors.amber },
  couponCodeStrip: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.background, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  couponCode: { fontSize: 13, fontWeight: '800', color: colors.primary, letterSpacing: 1 },
  couponAuto: { fontSize: 11, color: colors.textSecondary },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.background },
  tierBadge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tierBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  tierLabel: { fontWeight: '700', fontSize: 14, color: colors.textSecondary },
  tierDetail: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  tierAmount: { fontSize: 16, fontWeight: '800' },
  nextTierNote: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 12 },
});
