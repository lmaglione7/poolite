import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'poolite.wishlist.v1';

interface WishlistApi {
  ids: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistApi | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      setIds(await loadJSON<string[]>(STORAGE_KEY, []));
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, ids);
  }, [ids]);

  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const { data } = await supabase.from('wishlist').select('product_id').eq('user_id', user.id);
      if (data && data.length > 0) setIds((cur) => (cur.length > 0 ? cur : data.map((r) => r.product_id)));
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!supabase || !user || !hydrated.current) return;
    (async () => {
      await supabase.from('wishlist').delete().eq('user_id', user.id);
      if (ids.length > 0) {
        await supabase.from('wishlist').upsert(ids.map((product_id) => ({ user_id: user.id, product_id })));
      }
    })();
  }, [ids, user?.id]);

  const api = useMemo<WishlistApi>(
    () => ({
      ids,
      count: ids.length,
      has: (id) => ids.includes(id),
      toggle: (id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur])),
      remove: (id) => setIds((cur) => cur.filter((x) => x !== id)),
    }),
    [ids]
  );

  return <WishlistContext.Provider value={api}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
