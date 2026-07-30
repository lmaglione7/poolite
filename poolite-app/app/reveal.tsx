import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PooliteLogo } from '../src/components/PooliteLogo';
import { WaveDivider } from '../src/components/WaveDivider';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors } from '../src/theme/colors';
import { usePoolProfile } from '../src/state/PoolProfileContext';
import { useAuth } from '../src/state/AuthContext';
import { estimateCost, poolVolumeM3 } from '../src/lib/poolMath';
import { formatEuro } from '../src/data/products';

export default function Reveal() {
  const profile = usePoolProfile();
  const auth = useAuth();
  const pop = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
  }, [pop]);

  const volume = poolVolumeM3(profile.size ?? 'M', profile.dims);
  const cost = estimateCost(volume, profile.pump ?? '1');

  function goApp() {
    profile.completeOnboarding();
    if (auth.configured && !auth.user) router.replace('/(auth)/signup');
    else router.replace('/loading');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <PooliteLogo height={36} />
        <Animated.Text style={[styles.drop, { transform: [{ scale: pop }] }]}>💧</Animated.Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+50 gocce di benvenuto</Text>
        </View>
        <WaveDivider style={{ paddingVertical: 22 }} />
        <Text style={styles.line}>La tua piscina ti costa circa</Text>
        <Text style={styles.hero}>{formatEuro(cost.costEveryone)}</Text>
        <Text style={styles.line}>al giorno.</Text>
        <Text style={styles.pitch}>
          Posso fartene risparmiare <Text style={{ color: colors.amber }}>quasi {formatEuro(cost.savingsToday)}</Text>.
        </Text>
        <PrimaryButton label="Fammi vedere" onPress={goApp} style={styles.cta} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 40 },
  drop: { fontSize: 64, marginTop: 8 },
  badge: {
    marginTop: 10,
    backgroundColor: colors.selectedBg,
    borderWidth: 1,
    borderColor: colors.selectedBorder,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  badgeText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  line: { color: colors.textSecondary, fontSize: 17, textAlign: 'center' },
  hero: { fontSize: 64, fontWeight: '800', color: colors.primary, letterSpacing: -2, marginVertical: 6 },
  pitch: { marginTop: 18, fontSize: 19, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  cta: { marginTop: 36, paddingHorizontal: 46 },
});
