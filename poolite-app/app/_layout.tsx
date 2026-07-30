import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/state/AuthContext';
import { PoolProfileProvider } from '../src/state/PoolProfileContext';
import { CartProvider } from '../src/state/CartContext';
import { SubscriptionsProvider } from '../src/state/SubscriptionsContext';
import { RewardsProvider } from '../src/state/RewardsContext';
import { SettingsProvider } from '../src/state/SettingsContext';
import { DevStateProvider } from '../src/state/DevStateContext';
import { AppStripeProvider } from '../src/components/AppStripeProvider';
import { MilestoneOverlay } from '../src/components/MilestoneOverlay';
import { colors } from '../src/theme/colors';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <PoolProfileProvider>
          <CartProvider>
            <SubscriptionsProvider>
              <RewardsProvider>
                <DevStateProvider>
                  <AppStripeProvider>{children}</AppStripeProvider>
                </DevStateProvider>
              </RewardsProvider>
            </SubscriptionsProvider>
          </CartProvider>
        </PoolProfileProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Providers>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="reveal" />
            <Stack.Screen name="loading" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="report" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="manuale/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="impostazioni" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="premi" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="legale/termini" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="legale/privacy" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="dev-menu" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
          <MilestoneOverlay />
        </Providers>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
