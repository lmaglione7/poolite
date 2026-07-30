import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PooliteLogo } from '../../src/components/PooliteLogo';
import { WaveDivider } from '../../src/components/WaveDivider';
import { SelectableCard } from '../../src/components/SelectableCard';
import { PressableScale } from '../../src/components/PressableScale';
import { colors } from '../../src/theme/colors';
import { usePoolProfile } from '../../src/state/PoolProfileContext';
import { PoolSize, PumpHp } from '../../src/lib/poolMath';
import { searchCities, CitySuggestion } from '../../src/lib/weather';

const SIZES: { id: PoolSize; label: string; m: string; w: number; h: number }[] = [
  { id: 'S', label: 'Piccola', m: 'fino a 4 m · ~10 m³', w: 34, h: 22 },
  { id: 'M', label: 'Media', m: '4–7 m · ~25 m³', w: 48, h: 30 },
  { id: 'L', label: 'Grande', m: '7–10 m · ~45 m³', w: 64, h: 38 },
  { id: 'XL', label: 'Grandissima', m: 'oltre 10 m · 60+ m³', w: 80, h: 46 },
];

const PUMPS: PumpHp[] = ['0.5', '0.75', '1', '1.5', '2'];

const TREATMENTS: { id: 'cloro' | 'sale' | 'boh'; label: string; sub: string; emoji: string }[] = [
  { id: 'cloro', label: 'Cloro', sub: 'pastiglie o granulare', emoji: '🧴' },
  { id: 'sale', label: 'Sale', sub: 'elettrolisi del sale', emoji: '🧂' },
  { id: 'boh', label: 'Non lo so', sub: 'nessun problema, scopriamolo insieme', emoji: '🤷' },
];

function StepFade({ children, stepKey }: { children: React.ReactNode; stepKey: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(14);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function Onboarding() {
  const profile = usePoolProfile();
  const [step, setStep] = useState(0);
  const [showExact, setShowExact] = useState(false);
  const [dimL, setDimL] = useState('');
  const [dimW, setDimW] = useState('');
  const [dimD, setDimD] = useState('');
  const [city, setCityText] = useState('');
  const [cityPicked, setCityPicked] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);

  function next() {
    if (step >= 3) router.replace('/reveal');
    else setStep((s) => s + 1);
  }

  function pickSize(id: PoolSize) {
    profile.setSize(id);
    setTimeout(next, 380);
  }
  function useExactDims() {
    profile.setDims({ l: dimL, w: dimW, d: dimD });
    profile.setSize('custom');
    setTimeout(next, 380);
  }
  function pickPump(hp: PumpHp) {
    profile.setPump(hp);
    setTimeout(next, 380);
  }
  function pickTreatment(t: 'cloro' | 'sale' | 'boh') {
    profile.setTreatment(t);
    setTimeout(next, 380);
  }

  useEffect(() => {
    if (!city.trim() || cityPicked) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(() => {
      searchCities(city).then(setSuggestions).catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [city, cityPicked]);

  function pickCity(c: CitySuggestion) {
    setCityText(c.name);
    setCityPicked(c.name);
    profile.setCity(c.name, c.latitude, c.longitude);
    setSuggestions([]);
    setTimeout(next, 380);
  }

  function useTypedCity() {
    profile.setCity(city.trim(), null, null);
    next();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.logoRow}>
            <PooliteLogo height={40} />
          </View>

          <View style={styles.headerRow}>
            {step > 0 ? (
              <PressableScale onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
                <Text style={styles.backChevron}>‹</Text>
              </PressableScale>
            ) : (
              <View style={styles.backBtnSpacer} />
            )}
            <View style={styles.dots}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i <= step ? colors.primary : colors.border }]} />
              ))}
            </View>
            <View style={styles.backBtnSpacer} />
          </View>

          <WaveDivider />

          {step === 0 && (
            <StepFade stepKey={0}>
              <Text style={styles.h1}>Quanto è grande la tua piscina?</Text>
              <Text style={styles.sub}>Più o meno, a occhio. Va benissimo così 🙂</Text>
              <View style={styles.grid2}>
                {SIZES.map((s) => (
                  <SelectableCard key={s.id} selected={profile.size === s.id} onPress={() => pickSize(s.id)} style={styles.sizeCard}>
                    <View style={styles.sizeCircleWrap}>
                      <View
                        style={{
                          width: s.w,
                          height: s.h,
                          borderRadius: 999,
                          backgroundColor: colors.accent,
                        }}
                      />
                    </View>
                    <Text style={styles.sizeLabel}>{s.label}</Text>
                    <Text style={styles.sizeMeta}>{s.m}</Text>
                  </SelectableCard>
                ))}
              </View>
              {!showExact ? (
                <PressableScale onPress={() => setShowExact(true)} haptic={false}>
                  <Text style={styles.linkCenter}>Preferisco inserire le misure esatte</Text>
                </PressableScale>
              ) : (
                <View style={styles.exactCard}>
                  <View style={styles.exactRow}>
                    <TextInput value={dimL} onChangeText={setDimL} placeholder="Lungh. m" keyboardType="decimal-pad" style={styles.exactInput} placeholderTextColor={colors.textSecondary} />
                    <TextInput value={dimW} onChangeText={setDimW} placeholder="Largh. m" keyboardType="decimal-pad" style={styles.exactInput} placeholderTextColor={colors.textSecondary} />
                    <TextInput value={dimD} onChangeText={setDimD} placeholder="Prof. m" keyboardType="decimal-pad" style={styles.exactInput} placeholderTextColor={colors.textSecondary} />
                  </View>
                  <PressableScale onPress={useExactDims} style={styles.exactBtn}>
                    <Text style={styles.exactBtnLabel}>Usa queste misure</Text>
                  </PressableScale>
                </View>
              )}
            </StepFade>
          )}

          {step === 1 && (
            <StepFade stepKey={1}>
              <Text style={styles.h1}>Che pompa hai?</Text>
              <Text style={styles.sub}>Di solito c’è scritto sull’etichetta, vicino al filtro.</Text>
              <View style={styles.grid3}>
                {PUMPS.map((hp) => (
                  <SelectableCard key={hp} selected={profile.pump === hp} onPress={() => pickPump(hp)} style={styles.pumpCard}>
                    <Text style={styles.pumpHp}>{hp}</Text>
                    <Text style={styles.pumpUnit}>HP</Text>
                  </SelectableCard>
                ))}
              </View>
              <SelectableCard selected={profile.pump === 'boh'} onPress={() => pickPump('boh')} style={styles.noPumpCard}>
                <Text style={styles.noPumpLabel}>Non lo so 🤷</Text>
              </SelectableCard>
              <Text style={styles.footnote}>Se non lo sai, faccio io: parto da una pompa da 1 HP, la più comune.</Text>
            </StepFade>
          )}

          {step === 2 && (
            <StepFade stepKey={2}>
              <Text style={styles.h1}>Dove si trova la piscina?</Text>
              <Text style={styles.sub}>Mi serve per leggere il meteo di casa tua ☀️</Text>
              <TextInput
                value={city}
                onChangeText={(t) => {
                  setCityText(t);
                  setCityPicked(null);
                }}
                placeholder="Scrivi la tua città…"
                placeholderTextColor={colors.textSecondary}
                style={styles.cityInput}
              />
              {suggestions.length > 0 && (
                <View style={styles.suggestBox}>
                  {suggestions.map((c, i) => (
                    <PressableScale key={c.name + i} onPress={() => pickCity(c)} haptic={false} style={[styles.suggestRow, i === suggestions.length - 1 && { borderBottomWidth: 0 }]}>
                      <Text style={styles.suggestText}>
                        📍 {c.name}
                        {c.admin1 ? `, ${c.admin1}` : ''}
                      </Text>
                    </PressableScale>
                  ))}
                </View>
              )}
              {city.trim().length >= 2 && (
                <PressableScale onPress={useTypedCity} style={styles.continueBtn}>
                  <Text style={styles.continueBtnLabel}>Continua con "{city.trim()}"</Text>
                </PressableScale>
              )}
            </StepFade>
          )}

          {step === 3 && (
            <StepFade stepKey={3}>
              <Text style={styles.h1}>Come tieni pulita l’acqua?</Text>
              <Text style={styles.sub}>Ultima domanda, promesso 🙌</Text>
              <View style={{ gap: 12 }}>
                {TREATMENTS.map((t) => (
                  <SelectableCard key={t.id} selected={profile.treatment === t.id} onPress={() => pickTreatment(t.id)} style={styles.treatmentCard}>
                    <Text style={styles.treatmentEmoji}>{t.emoji}</Text>
                    <View>
                      <Text style={styles.treatmentLabel}>{t.label}</Text>
                      <Text style={styles.treatmentSub}>{t.sub}</Text>
                    </View>
                  </SelectableCard>
                ))}
              </View>
            </StepFade>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40, flexGrow: 1 },
  logoRow: { alignItems: 'center', paddingVertical: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', height: 34, marginTop: 8 },
  backBtnSpacer: { width: 34, height: 34 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 18, marginBottom: 6, lineHeight: 34 },
  sub: { color: colors.textSecondary, fontSize: 15, marginBottom: 20 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sizeCard: { width: '47%', padding: 16, alignItems: 'center', gap: 10 },
  sizeCircleWrap: { height: 52, alignItems: 'center', justifyContent: 'center' },
  sizeLabel: { fontWeight: '800', fontSize: 16, color: colors.primary },
  sizeMeta: { fontSize: 12, color: colors.textSecondary },
  grid3: { flexDirection: 'row', gap: 12 },
  pumpCard: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  pumpHp: { fontSize: 22, fontWeight: '800', color: colors.primary },
  pumpUnit: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  noPumpCard: { marginTop: 14, paddingVertical: 16, alignItems: 'center' },
  noPumpLabel: { fontWeight: '700', fontSize: 16, color: colors.primary },
  footnote: { marginTop: 10, color: colors.textSecondary, fontSize: 13, textAlign: 'center' },
  linkCenter: { marginTop: 16, textAlign: 'center', color: colors.accent, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  exactCard: { marginTop: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16 },
  exactRow: { flexDirection: 'row', gap: 10 },
  exactInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 15, backgroundColor: colors.background, color: colors.textPrimary },
  exactBtn: { marginTop: 12, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  exactBtnLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  cityInput: { borderWidth: 2, borderColor: colors.border, borderRadius: 16, padding: 16, fontSize: 17, backgroundColor: colors.card, color: colors.textPrimary, fontWeight: '600' },
  suggestBox: { marginTop: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' },
  suggestRow: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.background },
  suggestText: { fontSize: 16, color: colors.textPrimary },
  continueBtn: { marginTop: 16, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center' },
  continueBtnLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  treatmentCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  treatmentEmoji: { fontSize: 26 },
  treatmentLabel: { fontWeight: '800', fontSize: 17, color: colors.primary },
  treatmentSub: { fontSize: 13, color: colors.textSecondary },
});
