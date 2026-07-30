import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';

// Italy-only for now (shipping, VAT and the technician network are Italian),
// but the interface language is switchable — the app ships Italian first and
// the other locales land as translations are completed.
export const COUNTRY = { code: 'IT', label: 'Italia', flag: '🇮🇹' } as const;
export const CURRENCY = { code: 'EUR', symbol: '€', label: 'Euro (€)' } as const;

export type LanguageCode = 'it' | 'en' | 'de' | 'fr' | 'es';

export const LANGUAGES: { code: LanguageCode; label: string; flag: string; ready: boolean }[] = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹', ready: true },
  { code: 'en', label: 'English', flag: '🇬🇧', ready: false },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', ready: false },
  { code: 'fr', label: 'Français', flag: '🇫🇷', ready: false },
  { code: 'es', label: 'Español', flag: '🇪🇸', ready: false },
];

interface SettingsState {
  language: LanguageCode;
  notifyPumpWindow: boolean;
  notifyDailyQuestion: boolean;
  notifyRestock: boolean;
  notifyOffers: boolean;
  marketingEmails: boolean;
  analyticsConsent: boolean;
  zoneComparisonOptIn: boolean;
}

const STORAGE_KEY = 'poolite.settings.v1';

const DEFAULT_STATE: SettingsState = {
  language: 'it',
  notifyPumpWindow: true,
  notifyDailyQuestion: true,
  notifyRestock: true,
  notifyOffers: false, // opt-in, never on by default: trust is the product
  marketingEmails: false,
  analyticsConsent: false,
  zoneComparisonOptIn: true,
};

interface SettingsApi extends SettingsState {
  set: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}

const SettingsContext = createContext<SettingsApi | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SettingsState>(DEFAULT_STATE);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      setState(await loadJSON(STORAGE_KEY, DEFAULT_STATE));
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, state);
  }, [state]);

  const api = useMemo<SettingsApi>(
    () => ({ ...state, set: (key, value) => setState((s) => ({ ...s, [key]: value })) }),
    [state]
  );

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
