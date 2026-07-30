import { Platform } from 'react-native';

export const APP_GROUP = 'group.it.poolite.app';

/**
 * Pushes the Salvadanaio numbers into the shared App Group storage that the
 * iOS home-screen widget (targets/widget/) reads, then asks WidgetKit to
 * refresh. No-ops everywhere the native module isn't present (web, Expo Go,
 * Android) — the widget only exists in an iOS development/production build.
 */
export function updateSalvadanaioWidget(data: {
  cumulativeSavings: number;
  savedToday: number;
  days: number;
  streak: number;
}) {
  if (Platform.OS !== 'ios') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ExtensionStorage } = require('@bacons/apple-targets');
    const storage = new ExtensionStorage(APP_GROUP);
    storage.set('salvadanaio', {
      total: Math.round(data.cumulativeSavings * 100) / 100,
      today: Math.round(data.savedToday * 100) / 100,
      days: data.days,
      streak: data.streak,
      updatedAt: new Date().toISOString(),
    });
    ExtensionStorage.reloadWidget();
  } catch {
    // Native module unavailable (Expo Go / simulator without the target) — fine.
  }
}
