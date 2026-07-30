import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export const REFERRAL_REWARD = 30; // € off the next order, per friend who signs up

export interface Coupon {
  code: string;
  label: string;
  /** Fixed amount off in €. */
  amount: number;
  /** Minimum cart subtotal required (€). */
  minSpend: number;
  reason: string;
  used: boolean;
  earnedAtISO: string;
}

/**
 * Loyalty ladder: each tier unlocks once, when the customer's completed order
 * count reaches it. Honest and predictable — no spinning wheels, no fake
 * countdowns; the coupon simply appears and stays until used.
 */
export const LOYALTY_TIERS: { orders: number; amount: number; minSpend: number; label: string }[] = [
  { orders: 1, amount: 5, minSpend: 30, label: 'Grazie per il primo ordine' },
  { orders: 3, amount: 10, minSpend: 50, label: 'Cliente affezionato' },
  { orders: 5, amount: 15, minSpend: 60, label: 'Poolite Club' },
  { orders: 10, amount: 30, minSpend: 90, label: 'Veterano della piscina' },
  { orders: 20, amount: 50, minSpend: 120, label: 'Leggenda Poolite' },
];

interface RewardsState {
  orderCount: number;
  coupons: Coupon[];
  referralCode: string | null;
  referredFriends: number;
  claimedTiers: number[];
}

const STORAGE_KEY = 'poolite.rewards.v1';

const DEFAULT_STATE: RewardsState = {
  orderCount: 0,
  coupons: [],
  referralCode: null,
  referredFriends: 0,
  claimedTiers: [],
};

function makeReferralCode(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return 'POOL' + h.toString(36).toUpperCase().slice(0, 5).padEnd(5, 'X');
}

interface RewardsApi extends RewardsState {
  availableCoupons: Coupon[];
  /** Best applicable coupon for a given cart subtotal, or null. */
  bestCouponFor: (subtotal: number) => Coupon | null;
  registerOrder: () => void;
  markCouponUsed: (code: string) => void;
  registerReferralSignup: () => void;
  referralLink: string;
  nextTier: { orders: number; amount: number; label: string } | null;
}

const RewardsContext = createContext<RewardsApi | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<RewardsState>(DEFAULT_STATE);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      const local = await loadJSON<RewardsState>(STORAGE_KEY, DEFAULT_STATE);
      setState({ ...local, referralCode: local.referralCode ?? makeReferralCode(String(Date.now())) });
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, state);
  }, [state]);

  // Once signed in, the code is derived from the user id so it is stable
  // across devices, and referral counts come from the server.
  useEffect(() => {
    if (!user) return;
    setState((s) => ({ ...s, referralCode: makeReferralCode(user.id) }));
    if (!supabase) return;
    (async () => {
      const { count } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', user.id);
      if (typeof count === 'number') setState((s) => ({ ...s, referredFriends: count }));
    })();
  }, [user?.id]);

  const api = useMemo<RewardsApi>(() => {
    const availableCoupons = state.coupons.filter((c) => !c.used);

    return {
      ...state,
      availableCoupons,
      bestCouponFor: (subtotal) => {
        const usable = availableCoupons.filter((c) => subtotal >= c.minSpend);
        if (usable.length === 0) return null;
        return usable.reduce((best, c) => (c.amount > best.amount ? c : best));
      },
      registerOrder: () =>
        setState((s) => {
          const orderCount = s.orderCount + 1;
          const tier = LOYALTY_TIERS.find((t) => t.orders === orderCount && !s.claimedTiers.includes(t.orders));
          if (!tier) return { ...s, orderCount };
          const coupon: Coupon = {
            code: `FEDELTA${tier.amount}`,
            label: tier.label,
            amount: tier.amount,
            minSpend: tier.minSpend,
            reason: `Sbloccato al tuo ordine numero ${tier.orders}`,
            used: false,
            earnedAtISO: new Date().toISOString(),
          };
          return { ...s, orderCount, coupons: [...s.coupons, coupon], claimedTiers: [...s.claimedTiers, tier.orders] };
        }),
      markCouponUsed: (code) =>
        setState((s) => ({ ...s, coupons: s.coupons.map((c) => (c.code === code ? { ...c, used: true } : c)) })),
      registerReferralSignup: () =>
        setState((s) => {
          const n = s.referredFriends + 1;
          const coupon: Coupon = {
            code: `AMICO${n}`,
            label: 'Un amico si è iscritto 🎉',
            amount: REFERRAL_REWARD,
            minSpend: 0,
            reason: 'Grazie per aver fatto conoscere Poolite',
            used: false,
            earnedAtISO: new Date().toISOString(),
          };
          return { ...s, referredFriends: n, coupons: [...s.coupons, coupon] };
        }),
      referralLink: `https://poolite.it/invito/${state.referralCode ?? ''}`,
      nextTier: LOYALTY_TIERS.find((t) => t.orders > state.orderCount) ?? null,
    };
  }, [state]);

  return <RewardsContext.Provider value={api}>{children}</RewardsContext.Provider>;
}

export function useRewards() {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error('useRewards must be used within RewardsProvider');
  return ctx;
}
