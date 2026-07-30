import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

/**
 * Hidden dev menu (reachable at /dev-menu via a long-press on the logo) — the
 * production equivalent of the prototype's "Tweaks" panel. Never shown in the
 * normal UI; lets QA force network-error / urgent-water / empty-piggy states
 * without waiting for the real conditions to occur.
 */
interface DevState {
  forceNetError: boolean;
  forceUrgentWater: boolean;
  forceEmptyPiggy: boolean;
  setForceNetError: (v: boolean) => void;
  setForceUrgentWater: (v: boolean) => void;
  setForceEmptyPiggy: (v: boolean) => void;
}

const DevStateContext = createContext<DevState | null>(null);

export function DevStateProvider({ children }: { children: ReactNode }) {
  const [forceNetError, setForceNetError] = useState(false);
  const [forceUrgentWater, setForceUrgentWater] = useState(false);
  const [forceEmptyPiggy, setForceEmptyPiggy] = useState(false);

  const value = useMemo(
    () => ({ forceNetError, forceUrgentWater, forceEmptyPiggy, setForceNetError, setForceUrgentWater, setForceEmptyPiggy }),
    [forceNetError, forceUrgentWater, forceEmptyPiggy]
  );

  return <DevStateContext.Provider value={value}>{children}</DevStateContext.Provider>;
}

export function useDevState() {
  const ctx = useContext(DevStateContext);
  if (!ctx) throw new Error('useDevState must be used within DevStateProvider');
  return ctx;
}
