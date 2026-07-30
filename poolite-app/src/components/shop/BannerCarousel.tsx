import { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale } from '../PressableScale';
import { ProductImage } from '../ProductImage';
import { colors } from '../../theme/colors';

const BANNERS = [
  { tag: 'OFFERTE ESCLUSIVE', title: 'Risparmia il 20% su robot pulitori e chimica smart', productId: 'robot' },
  { tag: 'SOLO CON POOLITE', title: 'Coperture su misura: −25% e l’acqua resta calda', productId: 'telo' },
  { tag: 'CONSEGNA GRATIS', title: 'Spedizione gratuita sopra i 39 €, sempre', productId: 'cloro5' },
];

const CARD_WIDTH = Dimensions.get('window').width * 0.86 - 18 * 2 * 0.14;

export function BannerCarousel() {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 10));
    if (i !== index) setIndex(i);
  }

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 10}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 2 }}
      >
        {BANNERS.map((b) => (
          <PressableScale key={b.productId} scaleTo={0.98} onPress={() => router.push(`/(tabs)/shop/${b.productId}`)}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.3 }}
              style={[styles.card, { width: CARD_WIDTH }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.tag}>{b.tag}</Text>
                <Text style={styles.title}>{b.title}</Text>
              </View>
              <ProductImage productId={b.productId} width={72} height={72} radius={16} />
            </LinearGradient>
          </PressableScale>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {BANNERS.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === index ? colors.primary : colors.border }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tag: { fontSize: 11, fontWeight: '800', color: colors.amberSoft, letterSpacing: 0.6 },
  title: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', lineHeight: 21, marginTop: 4 },
  dots: { flexDirection: 'row', gap: 5, justifyContent: 'center', paddingVertical: 10 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
