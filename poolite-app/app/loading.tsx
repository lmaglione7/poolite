import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PooliteLogo } from '../src/components/PooliteLogo';
import { colors } from '../src/theme/colors';

export default function LoadingScreen() {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -8, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    const t = setTimeout(() => router.replace('/(tabs)/oggi'), 1500);
    return () => clearTimeout(t);
  }, [float]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <PooliteLogo height={36} />
        <Animated.Text style={[styles.sun, { transform: [{ translateY: float }] }]}>☀️</Animated.Text>
        <Text style={styles.title}>Leggo il meteo…</Text>
        <Text style={styles.sub}>e il prezzo della corrente di oggi</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 40 },
  sun: { fontSize: 52, marginTop: 10 },
  title: { fontSize: 19, fontWeight: '700', color: colors.primary },
  sub: { fontSize: 14, color: colors.textSecondary },
});
