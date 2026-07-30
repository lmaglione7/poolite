import { ScrollView, View, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PooliteLogo } from './PooliteLogo';
import { colors } from '../theme/colors';

export function TabScreen({
  children,
  onRefresh,
  refreshing,
}: {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      >
        {/* Long-press the logo to reach the hidden dev menu (QA-only). */}
        <Pressable style={styles.logoRow} onLongPress={() => router.push('/dev-menu')} delayLongPress={900}>
          <PooliteLogo height={26} />
        </Pressable>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 120 },
  logoRow: { alignItems: 'center', paddingVertical: 8 },
});
