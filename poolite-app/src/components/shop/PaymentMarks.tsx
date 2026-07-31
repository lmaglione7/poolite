import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { CARD_SCHEMES, PAYMENT_METHODS } from '../../data/commerce';
import { paymentLogo } from '../../data/paymentLogos';

/** One brand mark: official artwork when present, tidy text badge until then. */
export function PaymentMark({ logoKey, label, height = 22 }: { logoKey: string; label: string; height?: number }) {
  const source = paymentLogo(logoKey);
  if (source) {
    return <Image source={source} style={{ height, width: height * 1.9 }} resizeMode="contain" accessibilityLabel={label} />;
  }
  return (
    <View style={[styles.textBadge, { height }]}>
      <Text style={styles.textBadgeLabel}>{label}</Text>
    </View>
  );
}

/** Accepted-payments strip: wallets + card schemes. */
export function PaymentMarks({ style, showLabel = true }: { style?: ViewStyle; showLabel?: boolean }) {
  return (
    <View style={style}>
      {showLabel && <Text style={styles.rowLabel}>PAGAMENTI ACCETTATI</Text>}
      <View style={styles.row}>
        {PAYMENT_METHODS.filter((m) => m.id !== 'card').map((m) => (
          <PaymentMark key={m.id} logoKey={m.logoKey} label={m.label} />
        ))}
        {CARD_SCHEMES.map((s) => (
          <PaymentMark key={s.key} logoKey={s.key} label={s.label} />
        ))}
      </View>
      <Text style={styles.secured}>🔒 Pagamenti protetti da Stripe · non salviamo mai i dati della tua carta</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowLabel: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.8, paddingHorizontal: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' },
  textBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  textBadgeLabel: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },
  secured: { fontSize: 11, color: colors.textSecondary, marginTop: 8, paddingHorizontal: 4 },
});
