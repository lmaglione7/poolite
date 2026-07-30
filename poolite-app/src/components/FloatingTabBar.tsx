import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { useWaterState } from '../hooks/useWaterState';

const LABELS: Record<string, string> = {
  oggi: 'Oggi',
  domani: 'Domani',
  acqua: 'Acqua',
  shop: 'Shop',
  tu: 'Tu',
};

// Loosely typed to what we actually use — the full BottomTabBarProps type
// lives at a non-public expo-router internal path, not worth depending on.
interface MinimalTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { emit: (e: { type: string; target: string; canPreventDefault: true }) => { defaultPrevented: boolean }; navigate: (name: string) => void };
}

export function FloatingTabBar({ state, navigation }: MinimalTabBarProps) {
  const insets = useSafeAreaInsets();
  const { urgent } = useWaterState();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 10) + 14 }]}>
      <BlurView intensity={60} tint="light" style={styles.blur}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const label = LABELS[route.name] ?? route.name;
            const showDot = route.name === 'shop' && urgent && !focused;

            return (
              <PressableScale
                key={route.key}
                haptic={false}
                scaleTo={0.95}
                onPress={() => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
                }}
                style={[styles.item, { backgroundColor: focused ? colors.primary : 'transparent' }]}
              >
                <Text style={[styles.label, { color: focused ? '#FFFFFF' : colors.textSecondary }]}>{label}</Text>
                {showDot && <View style={styles.dot} />}
              </PressableScale>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    borderRadius: 999,
    shadowColor: '#0E5A6D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  blur: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
  },
  row: { flexDirection: 'row' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 999 },
  label: { fontSize: 13, fontWeight: '800' },
  dot: { position: 'absolute', top: 6, right: 18, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.error },
});
