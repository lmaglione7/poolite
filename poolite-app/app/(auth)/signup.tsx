import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PooliteLogo } from '../../src/components/PooliteLogo';
import { WaveDivider } from '../../src/components/WaveDivider';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';
import { useAuth } from '../../src/state/AuthContext';

export default function Signup() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (!email.includes('@') || password.length < 6) {
      setError('Email valida e password di almeno 6 caratteri.');
      return;
    }
    setBusy(true);
    const { error: err } = await auth.signUp(email, password);
    setBusy(false);
    if (err) setError(err);
    else router.replace('/loading');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.logoRow}>
            <PooliteLogo height={36} />
          </View>
          <WaveDivider />
          <Text style={styles.h1}>Crea il tuo account</Text>
          <Text style={styles.sub}>Serve per salvare la tua piscina e i tuoi ordini, in sicurezza.</Text>

          {!auth.configured && (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Il backend non è ancora collegato: continua pure, potrai creare un account reale appena sarà pronto.
              </Text>
            </View>
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="La tua email"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Scegli una password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            style={styles.input}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PrimaryButton label={busy ? 'Un attimo…' : 'Crea account'} onPress={submit} disabled={busy} style={{ marginTop: 8 }} />

          {auth.configured ? (
            <Link href="/(auth)/login" style={styles.link}>
              Hai già un account? Accedi
            </Link>
          ) : (
            <Text onPress={() => router.replace('/loading')} style={styles.link}>
              Continua senza account (demo) ›
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logoRow: { alignItems: 'center', marginBottom: 4 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.primary, marginTop: 10, marginBottom: 6 },
  sub: { color: colors.textSecondary, fontSize: 15, marginBottom: 18 },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.card,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  noticeBox: { backgroundColor: colors.selectedBg, borderWidth: 1, borderColor: colors.selectedBorder, borderRadius: 16, padding: 14, marginBottom: 16 },
  noticeText: { color: colors.primary, fontSize: 13, lineHeight: 18 },
  errorBox: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: 14, padding: 12, marginBottom: 12 },
  errorText: { color: colors.errorText, fontSize: 13, fontWeight: '600' },
  link: { marginTop: 18, textAlign: 'center', color: colors.accent, fontWeight: '700', fontSize: 14 },
});
