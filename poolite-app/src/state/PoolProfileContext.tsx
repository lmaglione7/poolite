import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { PoolSize, PumpHp } from '../lib/poolMath';

export type Treatment = 'cloro' | 'sale' | 'boh';
export type WaterColor = 'azzurra' | 'torbida' | 'verdina';

export interface TreatmentLogEntry {
  id: string;
  name: string;
  emoji: string;
  whenISO: string;
}

export interface SavingsDay {
  dateISO: string;
  amount: number;
}

interface ProfileState {
  hasOnboarded: boolean;
  size: PoolSize | null;
  dims: { l: string; w: string; d: string };
  pump: PumpHp | null;
  city: string | null;
  cityLat: number | null;
  cityLon: number | null;
  treatment: Treatment | null;
  onboardedAtISO: string | null;
  gocce: number;
  streak: number;
  lastActiveDateISO: string | null;
  waterAnswer: { value: WaterColor; dateISO: string } | null;
  treatmentLogs: TreatmentLogEntry[];
  cumulativeSavings: number;
  savingsHistory: SavingsDay[];
  lastMilestone: number;
}

const STORAGE_KEY = 'poolite.profile.v1';

const DEFAULT_STATE: ProfileState = {
  hasOnboarded: false,
  size: null,
  dims: { l: '', w: '', d: '' },
  pump: null,
  city: null,
  cityLat: null,
  cityLon: null,
  treatment: null,
  onboardedAtISO: null,
  gocce: 0,
  streak: 0,
  lastActiveDateISO: null,
  waterAnswer: null,
  treatmentLogs: [
    { id: 'seed-1', name: 'Cloro', emoji: '🧴', whenISO: daysAgoISO(1) },
    { id: 'seed-2', name: 'pH−', emoji: '⚗️', whenISO: daysAgoISO(3) },
    { id: 'seed-3', name: 'Antialghe', emoji: '🌿', whenISO: daysAgoISO(12) },
  ],
  cumulativeSavings: 0,
  savingsHistory: [],
  lastMilestone: 0,
};

// Celebrated in ascending order as cumulativeSavings crosses each one.
export const MILESTONES = [10, 25, 50, 100, 200, 500, 1000];

function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  const then = new Date(iso.slice(0, 10)).getTime();
  const now = new Date(todayKey()).getTime();
  return Math.max(0, Math.round((now - then) / 86400000));
}

interface ProfileApi extends ProfileState {
  loading: boolean;
  setSize: (size: PoolSize) => void;
  setDims: (dims: Partial<{ l: string; w: string; d: string }>) => void;
  setPump: (pump: PumpHp) => void;
  setCity: (city: string, lat: number | null, lon: number | null) => void;
  setTreatment: (t: Treatment) => void;
  completeOnboarding: () => void;
  answerWaterQuestion: (color: WaterColor) => void;
  answeredToday: boolean;
  logTreatment: (name: string, emoji: string) => void;
  addSavings: (amountToday: number) => void;
  restart: () => void;
  daysSinceOnboarding: number;
  pendingMilestone: number | null;
  celebrateMilestone: () => void;
}

const ProfileContext = createContext<ProfileApi | null>(null);

export function PoolProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<ProfileState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  // Load local cache first (instant), then reconcile with Supabase if signed in.
  useEffect(() => {
    (async () => {
      const local = await loadJSON(STORAGE_KEY, DEFAULT_STATE);
      applyDailyBookkeeping(local, setState);
      hydrated.current = true;
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, state);
  }, [state]);

  // Best-effort sync to the `pools` table once a user is signed in: pull the
  // remote row if it's the source of truth, otherwise push local state up.
  useEffect(() => {
    if (!supabase || !user || !hydrated.current) return;
    (async () => {
      const { data } = await supabase.from('pools').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setState((s) => ({
          ...s,
          size: data.size ?? s.size,
          pump: data.pump ?? s.pump,
          city: data.city ?? s.city,
          cityLat: data.city_lat ?? s.cityLat,
          cityLon: data.city_lon ?? s.cityLon,
          treatment: data.treatment ?? s.treatment,
          hasOnboarded: data.has_onboarded ?? s.hasOnboarded,
        }));
      } else if (state.hasOnboarded) {
        await supabase.from('pools').upsert({
          user_id: user.id,
          size: state.size,
          pump: state.pump,
          city: state.city,
          city_lat: state.cityLat,
          city_lon: state.cityLon,
          treatment: state.treatment,
          has_onboarded: state.hasOnboarded,
        });
      }
    })();
    // Only on user id change (sign-in), not on every state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const api = useMemo<ProfileApi>(
    () => ({
      ...state,
      loading,
      answeredToday: state.waterAnswer?.dateISO === todayKey(),
      daysSinceOnboarding: daysSince(state.onboardedAtISO),
      setSize: (size) => setState((s) => ({ ...s, size })),
      setDims: (dims) => setState((s) => ({ ...s, dims: { ...s.dims, ...dims } })),
      setPump: (pump) => setState((s) => ({ ...s, pump })),
      setCity: (city, lat, lon) => setState((s) => ({ ...s, city, cityLat: lat, cityLon: lon })),
      setTreatment: (treatment) => setState((s) => ({ ...s, treatment })),
      completeOnboarding: () =>
        setState((s) => ({
          ...s,
          hasOnboarded: true,
          onboardedAtISO: s.onboardedAtISO ?? new Date().toISOString(),
          gocce: s.gocce + 50,
          streak: 1,
          lastActiveDateISO: todayKey(),
        })),
      answerWaterQuestion: (value) =>
        setState((s) =>
          s.waterAnswer?.dateISO === todayKey()
            ? s
            : { ...s, waterAnswer: { value, dateISO: todayKey() }, gocce: s.gocce + 10 }
        ),
      logTreatment: (name, emoji) =>
        setState((s) => ({
          ...s,
          treatmentLogs: [
            { id: String(Date.now()), name, emoji, whenISO: new Date().toISOString() },
            ...s.treatmentLogs,
          ].slice(0, 8),
        })),
      addSavings: (amountToday) =>
        setState((s) => {
          if (s.lastActiveDateISO === todayKey()) return s; // already accrued today
          return {
            ...s,
            cumulativeSavings: s.cumulativeSavings + amountToday,
            savingsHistory: [...s.savingsHistory, { dateISO: todayKey(), amount: amountToday }].slice(-90),
            lastActiveDateISO: todayKey(),
          };
        }),
      pendingMilestone: (() => {
        const next = MILESTONES.find((m) => m > state.lastMilestone && state.cumulativeSavings >= m);
        return next ?? null;
      })(),
      celebrateMilestone: () =>
        setState((s) => {
          const next = MILESTONES.find((m) => m > s.lastMilestone && s.cumulativeSavings >= m);
          return next ? { ...s, lastMilestone: next } : s;
        }),
      restart: () =>
        setState((s) => ({
          ...DEFAULT_STATE,
          gocce: s.gocce,
          treatmentLogs: s.treatmentLogs,
        })),
    }),
    [state, loading]
  );

  return <ProfileContext.Provider value={api}>{children}</ProfileContext.Provider>;
}

function applyDailyBookkeeping(local: ProfileState, setState: (fn: (s: ProfileState) => ProfileState) => void) {
  const gap = local.lastActiveDateISO ? daysSince(local.lastActiveDateISO) : 0;
  const streak = !local.lastActiveDateISO ? local.streak : gap === 0 ? local.streak : gap === 1 ? local.streak + 1 : 1;
  setState(() => ({ ...local, streak }));
}

export function usePoolProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('usePoolProfile must be used within PoolProfileProvider');
  return ctx;
}
