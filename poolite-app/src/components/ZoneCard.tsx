import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors } from '../theme/colors';
import { ZoneStats } from '../lib/zoneStats';
import { formatEuro } from '../data/products';

// Anonymous zone comparison card shown on Oggi — social proof without a feed.
export function ZoneCard({ stats }: { stats: ZoneStats }) {
  return (
    <Card soft style={{ marginTop: 12 }}>
      <View style={styles.row}>
        <Text style={{ fontSize: 22 }}>🏆</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Meglio del <Text style={styles.pct}>{stats.costPercentile}%</Text> delle piscine a {stats.city}
          </Text>
          <Text style={styles.sub}>
            Le piscine come la tua spendono in media {formatEuro(stats.avgDailyCost)} al giorno · {stats.poolsInZone} in zona
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  title: { fontWeight: '800', fontSize: 15, color: colors.textPrimary },
  pct: { color: colors.accent },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
});
