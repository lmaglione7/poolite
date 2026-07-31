import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '../theme/colors';
import { usePoolProfile } from '../state/PoolProfileContext';

const { width: SCREEN_W } = Dimensions.get('window');
const CONFETTI = ['💧', '✨', '🎉', '💛', '🩵'];

function ConfettiPiece({ index }: { index: number }) {
  const fall = useRef(new Animated.Value(-60)).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fall, {
      toValue: 500,
      duration: 2600 + (index % 5) * 400,
      delay: index * 90,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [fall, sway, index]);

  const left = (index * 73) % (SCREEN_W - 40);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top: 0,
        left,
        fontSize: 22,
        transform: [{ translateY: fall }, { translateX: sway.interpolate({ inputRange: [-1, 1], outputRange: [-14, 14] }) }],
      }}
    >
      {CONFETTI[index % CONFETTI.length]}
    </Animated.Text>
  );
}

// Shown once when cumulative savings crosses a milestone (25€, 50€, 100€…).
// Honest celebration: real number, no fake urgency, dismiss and move on.
export function MilestoneOverlay() {
  const profile = usePoolProfile();
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (profile.pendingMilestone != null) {
      scale.setValue(0.4);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    }
  }, [profile.pendingMilestone, scale]);

  if (profile.pendingMilestone == null) return null;

  return (
    <View style={styles.backdrop}>
      {Array.from({ length: 18 }).map((_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={{ fontSize: 44 }}>🐷</Text>
        <Text style={styles.title}>Traguardo!</Text>
        <Text style={styles.amount}>{profile.pendingMilestone} € risparmiati</Text>
        <Text style={styles.sub}>Soldi veri, rimasti in tasca tua. Avanti così 💪</Text>
        <PrimaryButton label="Grande!" onPress={profile.celebrateMilestone} style={{ marginTop: 18, paddingHorizontal: 40 }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18,49,58,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginHorizontal: 30,
    shadowColor: '#0E5A6D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.primary, marginTop: 6 },
  amount: { fontSize: 34, fontWeight: '800', color: colors.amber, letterSpacing: -1, marginTop: 4 },
  sub: { fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
