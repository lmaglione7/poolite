import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PooliteLogo } from '../../src/components/PooliteLogo';
import { WaveDivider } from '../../src/components/WaveDivider';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';
import { useAuth } from '../../src/state/AuthContext';

export default function Login() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    const { error: err } = await auth.signIn(email, password);
    setBusy(false);
    if (err) setError(err);
    else router.replace('/(tabs)/oggi');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.logoRow}>
            <PooliteLogo height={36} />
          </View>
          <WaveDivider />
          <Text style={styles.h1}>Bentornato 👋</Text>
          <Text style={styles.sub}>Accedi per ritrovare la tua piscina.</Text>

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
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            style={styles.input}
          />

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PrimaryButton label={busy ? 'Un attimo…' : 'Accedi'} onPress={submit} disabled={busy} style={{ marginTop: 8 }} />

          <Link href="/(auth)/signup" style={styles.link}>
            Non hai un account? Registrati
          </Link>
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
  errorBox: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: 14, padding: 12, marginBottom: 12 },
  errorText: { color: colors.errorText, fontSize: 13, fontWeight: '600' },
  link: { marginTop: 18, textAlign: 'center', color: colors.accent, fontWeight: '700', fontSize: 14 },
});
