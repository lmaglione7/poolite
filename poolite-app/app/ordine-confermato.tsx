import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { WaveDivider } from '../src/components/WaveDivider';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { PressableScale } from '../src/components/PressableScale';
import { colors } from '../src/theme/colors';
import { useOrders } from '../src/state/OrdersContext';
import { formatAddressLines } from '../src/state/AddressContext';
import { formatEuro } from '../src/data/products';

function formatDay(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));
}

export default function OrderConfirmedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById } = useOrders();
  const order = getById(id ?? '');
  const pop = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  }, [pop]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Animated.Text style={[styles.emoji, { transform: [{ scale: pop }] }]}>🎉</Animated.Text>
        <Text style={styles.title}>Ordine ricevuto!</Text>
        {order && <Text style={styles.number}>{order.number}</Text>}
        <WaveDivider />

        {order ? (
          <>
            <Card tone="selected" style={{ alignSelf: 'stretch', alignItems: 'center' }}>
              <Text style={styles.etaLabel}>CONSEGNA PREVISTA</Text>
              <Text style={styles.etaValue}>
                {order.estimatedDeliveryISO ? formatDay(order.estimatedDeliveryISO) : 'entro pochi giorni'}
              </Text>
              <Text style={styles.etaSub}>Ti avviso io appena il pacco parte 📦</Text>
            </Card>

            <Card soft style={{ alignSelf: 'stretch', marginTop: 12 }}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Totale pagato</Text>
                <Text style={styles.rowValue}>{formatEuro(order.total)}</Text>
              </View>
              <View style={[styles.row, { marginTop: 8 }]}>
                <Text style={styles.rowLabel}>Spedito a</Text>
                <Text style={styles.rowValueSmall} numberOfLines={2}>
                  {formatAddressLines(order.address).slice(0, 2).join(' · ')}
                </Text>
              </View>
            </Card>

            <PrimaryButton
              label="Segui il tuo ordine"
              onPress={() => router.replace(`/ordini/${order.id}`)}
              style={{ alignSelf: 'stretch', marginTop: 20 }}
            />
          </>
        ) : (
          <Text style={styles.fallback}>Ti abbiamo inviato la conferma via email.</Text>
        )}

        <PressableScale haptic={false} onPress={() => router.replace('/(tabs)/shop')} style={{ marginTop: 14 }}>
          <Text style={styles.link}>Continua a curiosare nel negozio ›</Text>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 64 },
  title: { fontSize: 26, fontWeight: '800', color: colors.primary, marginTop: 10 },
  number: { fontSize: 15, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1, marginTop: 4 },
  etaLabel: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.8 },
  etaValue: { fontSize: 20, fontWeight: '800', color: colors.primary, marginTop: 3, textAlign: 'center' },
  etaSub: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  rowValueSmall: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, flex: 1, textAlign: 'right' },
  fallback: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  link: { fontSize: 14, color: colors.accent, fontWeight: '700' },
});
