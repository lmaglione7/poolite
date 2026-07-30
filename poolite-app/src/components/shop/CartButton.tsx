import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PressableScale } from '../PressableScale';
import { useCart } from '../../state/CartContext';
import { colors } from '../../theme/colors';

export function CartButton() {
  const cart = useCart();
  return (
    <PressableScale scaleTo={0.93} onPress={() => router.push('/(tabs)/shop/cart')} style={styles.btn}>
      <Text style={{ fontSize: 19 }}>🛒</Text>
      {cart.count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cart.count}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
});
