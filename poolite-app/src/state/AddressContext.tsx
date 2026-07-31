import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface ShippingAddress {
  id: string;
  label: string; // "Casa", "Ufficio"…
  firstName: string;
  lastName: string;
  phone: string;
  street: string; // via e numero civico
  extra: string; // scala, interno, citofono
  cap: string;
  city: string;
  province: string;
  notes: string; // istruzioni per il corriere
  isDefault: boolean;
}

const STORAGE_KEY = 'poolite.addresses.v1';

export function formatAddressLines(a: ShippingAddress): string[] {
  return [
    `${a.firstName} ${a.lastName}`.trim(),
    a.street + (a.extra ? ` · ${a.extra}` : ''),
    `${a.cap} ${a.city} (${a.province.toUpperCase()})`,
    a.phone,
  ].filter(Boolean);
}

interface AddressApi {
  addresses: ShippingAddress[];
  defaultAddress: ShippingAddress | null;
  getById: (id: string) => ShippingAddress | undefined;
  save: (address: Omit<ShippingAddress, 'id'> & { id?: string }) => ShippingAddress;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  loading: boolean;
}

const AddressContext = createContext<AddressApi | null>(null);

export function AddressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      setAddresses(await loadJSON<ShippingAddress[]>(STORAGE_KEY, []));
      hydrated.current = true;
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, addresses);
  }, [addresses]);

  // Pull the server copy on sign-in; the device list wins only when the
  // server has nothing yet (fresh account on an already-used device).
  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id);
      if (data && data.length > 0) {
        setAddresses(
          data.map((r: any) => ({
            id: r.id,
            label: r.label ?? 'Casa',
            firstName: r.first_name,
            lastName: r.last_name,
            phone: r.phone,
            street: r.street,
            extra: r.extra ?? '',
            cap: r.cap,
            city: r.city,
            province: r.province,
            notes: r.notes ?? '',
            isDefault: r.is_default,
          }))
        );
      }
    })();
  }, [user?.id]);

  async function syncUp(list: ShippingAddress[]) {
    if (!supabase || !user) return;
    await supabase.from('addresses').delete().eq('user_id', user.id);
    if (list.length === 0) return;
    await supabase.from('addresses').upsert(
      list.map((a) => ({
        id: a.id,
        user_id: user.id,
        label: a.label,
        first_name: a.firstName,
        last_name: a.lastName,
        phone: a.phone,
        street: a.street,
        extra: a.extra,
        cap: a.cap,
        city: a.city,
        province: a.province.toUpperCase(),
        notes: a.notes,
        is_default: a.isDefault,
      }))
    );
  }

  const api = useMemo<AddressApi>(
    () => ({
      addresses,
      loading,
      defaultAddress: addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,
      getById: (id) => addresses.find((a) => a.id === id),
      save: (input) => {
        const id = input.id ?? `addr_${Date.now()}`;
        const isFirst = addresses.length === 0;
        const saved: ShippingAddress = { ...input, id, isDefault: input.isDefault || isFirst };
        setAddresses((cur) => {
          const others = cur.filter((a) => a.id !== id);
          // Only one default at a time.
          const next = saved.isDefault ? others.map((a) => ({ ...a, isDefault: false })) : others;
          const list = [...next, saved];
          syncUp(list);
          return list;
        });
        return saved;
      },
      remove: (id) =>
        setAddresses((cur) => {
          const list = cur.filter((a) => a.id !== id);
          // Never leave the book without a default.
          if (list.length > 0 && !list.some((a) => a.isDefault)) list[0] = { ...list[0], isDefault: true };
          syncUp(list);
          return list;
        }),
      setDefault: (id) =>
        setAddresses((cur) => {
          const list = cur.map((a) => ({ ...a, isDefault: a.id === id }));
          syncUp(list);
          return list;
        }),
    }),
    [addresses, loading, user?.id]
  );

  return <AddressContext.Provider value={api}>{children}</AddressContext.Provider>;
}

export function useAddresses() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error('useAddresses must be used within AddressProvider');
  return ctx;
}
