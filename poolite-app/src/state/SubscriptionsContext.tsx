import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { usePoolProfile } from './PoolProfileContext';

export const SUBSCRIPTION_DISCOUNT = 0.1; // "Scorta automatica −10%"

export interface Subscription {
  productId: string;
  weeks: number;
  nextDateISO: string;
  paused: boolean;
}

const STORAGE_KEY = 'poolite.subscriptions.v1';

// Which treatment-diary chips inform the auto frequency of each product.
const PRODUCT_TREATMENT_NAMES: Record<string, string[]> = {
  cloro5: ['Cloro'],
  shock: ['Cloro'],
  antialghe: ['Antialghe'],
  floc: ['Flocculante'],
  sale25: ['Cloro'],
  kit: ['Cloro', 'pH+', 'pH−'],
  filtro: [],
};

const DEFAULT_WEEKS = 3;

function addWeeksISO(weeks: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

interface SubscriptionsApi {
  subscriptions: Subscription[];
  isSubscribed: (productId: string) => boolean;
  getSubscription: (productId: string) => Subscription | undefined;
  /** Suggested refill interval in weeks, from the user's own treatment diary. */
  suggestedWeeks: (productId: string) => number;
  subscribe: (productId: string, weeks?: number) => void;
  unsubscribe: (productId: string) => void;
  setPaused: (productId: string, paused: boolean) => void;
  skipNext: (productId: string) => void;
  setWeeks: (productId: string, weeks: number) => void;
}

const SubscriptionsContext = createContext<SubscriptionsApi | null>(null);

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const profile = usePoolProfile();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      setSubs(await loadJSON<Subscription[]>(STORAGE_KEY, []));
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, subs);
  }, [subs]);

  // Best-effort mirror to Supabase `subscriptions` so the backend can drive
  // fulfillment once it exists.
  useEffect(() => {
    if (!supabase || !user || !hydrated.current) return;
    (async () => {
      await supabase.from('subscriptions').delete().eq('user_id', user.id);
      if (subs.length > 0) {
        await supabase.from('subscriptions').upsert(
          subs.map((s) => ({
            user_id: user.id,
            product_id: s.productId,
            weeks: s.weeks,
            next_date: s.nextDateISO,
            paused: s.paused,
          }))
        );
      }
    })();
  }, [subs, user?.id]);

  const api = useMemo<SubscriptionsApi>(() => {
    const byId = Object.fromEntries(subs.map((s) => [s.productId, s]));

    function suggestedWeeks(productId: string): number {
      const names = PRODUCT_TREATMENT_NAMES[productId];
      if (!names || names.length === 0) return DEFAULT_WEEKS;
      const times = profile.treatmentLogs
        .filter((l) => names.includes(l.name))
        .map((l) => new Date(l.whenISO).getTime())
        .sort((a, b) => a - b);
      if (times.length < 2) return DEFAULT_WEEKS;
      const gaps = times.slice(1).map((t, i) => t - times[i]);
      const avgDays = gaps.reduce((a, b) => a + b, 0) / gaps.length / 86400000;
      // A refill covers several treatments; scale the treatment cadence up.
      const weeks = Math.round((avgDays * 4) / 7);
      return Math.min(8, Math.max(2, weeks || DEFAULT_WEEKS));
    }

    return {
      subscriptions: subs,
      isSubscribed: (id) => !!byId[id],
      getSubscription: (id) => byId[id],
      suggestedWeeks,
      subscribe: (id, weeks) => {
        const w = weeks ?? suggestedWeeks(id);
        setSubs((cur) => [
          ...cur.filter((s) => s.productId !== id),
          { productId: id, weeks: w, nextDateISO: addWeeksISO(w), paused: false },
        ]);
      },
      unsubscribe: (id) => setSubs((cur) => cur.filter((s) => s.productId !== id)),
      setPaused: (id, paused) => setSubs((cur) => cur.map((s) => (s.productId === id ? { ...s, paused } : s))),
      skipNext: (id) =>
        setSubs((cur) =>
          cur.map((s) => (s.productId === id ? { ...s, nextDateISO: addWeeksISO(s.weeks, new Date(s.nextDateISO)) } : s))
        ),
      setWeeks: (id, weeks) =>
        setSubs((cur) => cur.map((s) => (s.productId === id ? { ...s, weeks, nextDateISO: addWeeksISO(weeks) } : s))),
    };
  }, [subs, profile.treatmentLogs]);

  return <SubscriptionsContext.Provider value={api}>{children}</SubscriptionsContext.Provider>;
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) throw new Error('useSubscriptions must be used within SubscriptionsProvider');
  return ctx;
}
