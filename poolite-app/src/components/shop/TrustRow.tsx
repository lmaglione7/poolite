import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { CARRIERS, PAYMENT_METHODS } from '../../data/commerce';

// Carrier + payment trust strip. Text badges by design: official partner
// logos require each brand's media kit and agreement — swap in later.
export function TrustRow({ style }: { style?: ViewStyle }) {
  return (
    <View style={style}>
      <Text style={styles.rowLabel}>SPEDIAMO CON</Text>
      <View style={styles.pillRow}>
        {CARRIERS.map((c) => (
          <View key={c.id} style={styles.pill}>
            <Text style={styles.pillText}>{c.name}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.rowLabel, { marginTop: 12 }]}>PAGA COME PREFERISCI</Text>
      <View style={styles.pillRow}>
        {PAYMENT_METHODS.map((p) => (
          <View key={p.id} style={styles.pill}>
            <Text style={styles.pillText}>
              {p.icon} {p.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowLabel: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.8, paddingHorizontal: 4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  pill: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.textPrimary },
});
