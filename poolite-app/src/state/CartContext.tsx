import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type CartMap = Record<string, number>;
const STORAGE_KEY = 'poolite.cart.v1';

interface CartApi {
  cart: CartMap;
  count: number;
  setQty: (productId: string, qty: number) => void;
  add: (productId: string) => void;
  inc: (productId: string) => void;
  dec: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartMap>({});
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      setCart(await loadJSON<CartMap>(STORAGE_KEY, {}));
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, cart);
  }, [cart]);

  // Pull the remote cart on sign-in (device-local cart wins if it's non-empty,
  // matching "your cart persists across pages" from the design brief).
  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const { data } = await supabase.from('cart_items').select('product_id, qty').eq('user_id', user.id);
      if (data && data.length > 0) {
        setCart((c) => (Object.keys(c).length > 0 ? c : Object.fromEntries(data.map((r) => [r.product_id, r.qty]))));
      }
    })();
  }, [user?.id]);

  // Best-effort push to Supabase so the cart is a real server-side resource.
  useEffect(() => {
    if (!supabase || !user || !hydrated.current) return;
    (async () => {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      const rows = Object.entries(cart).map(([product_id, qty]) => ({ user_id: user.id, product_id, qty }));
      if (rows.length > 0) await supabase.from('cart_items').upsert(rows);
    })();
  }, [cart, user?.id]);

  const api = useMemo<CartApi>(
    () => ({
      cart,
      count: Object.values(cart).reduce((a, b) => a + b, 0),
      setQty: (productId, qty) =>
        setCart((c) => {
          const next = { ...c };
          if (qty <= 0) delete next[productId];
          else next[productId] = qty;
          return next;
        }),
      add: (productId) => setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 })),
      inc: (productId) => setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 })),
      dec: (productId) =>
        setCart((c) => {
          const qty = (c[productId] ?? 0) - 1;
          const next = { ...c };
          if (qty <= 0) delete next[productId];
          else next[productId] = qty;
          return next;
        }),
      clear: () => setCart({}),
    }),
    [cart]
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
