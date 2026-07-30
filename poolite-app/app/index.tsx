import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { usePoolProfile } from '../src/state/PoolProfileContext';
import { useAuth } from '../src/state/AuthContext';
import { colors } from '../src/theme/colors';

export default function Index() {
  const profile = usePoolProfile();
  const auth = useAuth();

  if (profile.loading || auth.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!profile.hasOnboarded) return <Redirect href="/onboarding" />;
  if (auth.configured && !auth.user) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)/oggi" />;
}
