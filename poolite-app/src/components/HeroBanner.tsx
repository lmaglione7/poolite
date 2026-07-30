import { View, StyleSheet } from 'react-native';
import HeroSvg from '../../assets/img/hero-piscina.svg';

export function HeroBanner({ height = 128 }: { height?: number }) {
  return (
    <View style={[styles.wrap, { height }]}>
      <HeroSvg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#0E5A6D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
});
