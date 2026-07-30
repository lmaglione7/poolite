import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatEuro } from '../data/products';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

const PUMP_TAG = 'pump-window';
const SUB_TAG = 'subscription-reminder';

/**
 * The daily Hooked trigger: one notification at the start of today's (and
 * tomorrow's) optimal pump window, with the day's savings as the payoff.
 * Re-scheduled after each forecast load; never more than one per day.
 */
export async function schedulePumpWindowNotifications(plans: { dateISO: string; startHour: number; savings: number }[]) {
  if (Platform.OS === 'web') return;
  if (!(await ensureNotificationPermission())) return;

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((n) => n.content.data?.tag === PUMP_TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );

  const now = Date.now();
  for (const plan of plans) {
    const fireAt = new Date(`${plan.dateISO}T${String(plan.startHour).padStart(2, '0')}:00:00`);
    if (fireAt.getTime() <= now) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ È il momento: accendi la pompa',
        body: `Fascia conveniente da adesso. Oggi risparmi ${formatEuro(plan.savings)}.`,
        data: { tag: PUMP_TAG },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
    });
  }
}

/** "La tua scorta di X parte tra 3 giorni" — gentle heads-up, easy to skip. */
export async function scheduleSubscriptionReminder(productName: string, nextDateISO: string) {
  if (Platform.OS === 'web') return;
  if (!(await ensureNotificationPermission())) return;
  const fireAt = new Date(`${nextDateISO}T09:30:00`);
  fireAt.setDate(fireAt.getDate() - 3);
  if (fireAt.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📦 Scorta in arrivo',
      body: `${productName}: parte tra 3 giorni. Va bene così? Puoi saltarla con un tap.`,
      data: { tag: SUB_TAG },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}
