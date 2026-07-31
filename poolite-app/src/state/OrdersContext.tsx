import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { ShippingAddress } from './AddressContext';
import type { ShippingSpeed } from '../data/commerce';

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  number: string; // human-readable, e.g. PL-2A7F3C
  createdAtISO: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shippingCost: number;
  shippingSpeed: ShippingSpeed;
  total: number;
  address: ShippingAddress;
  carrier: string | null;
  trackingCode: string | null;
  estimatedDeliveryISO: string | null;
}

const STORAGE_KEY = 'poolite.orders.v1';

export const STATUS_META: Record<OrderStatus, { label: string; emoji: string; color: 'accent' | 'amber' | 'error' | 'muted' }> = {
  pending: { label: 'In attesa di pagamento', emoji: '⏳', color: 'amber' },
  paid: { label: 'Pagato', emoji: '✅', color: 'accent' },
  preparing: { label: 'In preparazione', emoji: '📦', color: 'accent' },
  shipped: { label: 'Spedito', emoji: '🚚', color: 'accent' },
  delivered: { label: 'Consegnato', emoji: '🎉', color: 'accent' },
  cancelled: { label: 'Annullato', emoji: '✕', color: 'error' },
};

/** The tracking timeline steps, in order. `cancelled` is handled separately. */
export const TRACKING_STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: 'paid', label: 'Ordine confermato', hint: 'Abbiamo ricevuto il pagamento' },
  { status: 'preparing', label: 'In preparazione', hint: 'Stiamo imballando i tuoi prodotti' },
  { status: 'shipped', label: 'Spedito', hint: 'Il pacco è partito verso di te' },
  { status: 'delivered', label: 'Consegnato', hint: 'Buona piscina! 🏊' },
];

export function orderProgress(status: OrderStatus): number {
  const i = TRACKING_STEPS.findIndex((s) => s.status === status);
  return i < 0 ? 0 : i;
}

function makeOrderNumber(): string {
  return 'PL-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

interface OrdersApi {
  orders: Order[];
  loading: boolean;
  getById: (id: string) => Order | undefined;
  /** Records a freshly placed order locally (the server row is created by the
   * payment edge function; this keeps the app usable in demo mode too). */
  addOrder: (input: Omit<Order, 'id' | 'number' | 'createdAtISO' | 'status' | 'carrier' | 'trackingCode' | 'estimatedDeliveryISO'> & { id?: string }) => Order;
  refresh: () => Promise<void>;
}

const OrdersContext = createContext<OrdersApi | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      setOrders(await loadJSON<Order[]>(STORAGE_KEY, []));
      hydrated.current = true;
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveJSON(STORAGE_KEY, orders);
  }, [orders]);

  async function refresh() {
    if (!supabase || !user) return;
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!data) return;
    setOrders(
      data.map((r: any) => ({
        id: r.id,
        number: r.order_number ?? makeOrderNumber(),
        createdAtISO: r.created_at,
        status: r.status,
        lines: (r.order_items ?? []).map((li: any) => ({
          productId: li.product_id,
          name: li.product_name ?? li.product_id,
          qty: li.qty,
          unitPrice: Number(li.unit_price),
        })),
        subtotal: Number(r.total) + Number(r.discount ?? 0) - Number(r.shipping_cost ?? 0),
        discount: Number(r.discount ?? 0),
        couponCode: r.coupon_code ?? null,
        shippingCost: Number(r.shipping_cost ?? 0),
        shippingSpeed: r.shipping_tier === 'express' ? 'express' : 'standard',
        total: Number(r.total),
        address: r.shipping_address,
        carrier: r.carrier ?? null,
        trackingCode: r.tracking_code ?? null,
        estimatedDeliveryISO: r.estimated_delivery ?? null,
      }))
    );
  }

  useEffect(() => {
    refresh();
  }, [user?.id]);

  const api = useMemo<OrdersApi>(
    () => ({
      orders,
      loading,
      getById: (id) => orders.find((o) => o.id === id),
      addOrder: (input) => {
        // Express: next working day. Standard: 2–3 days.
        const eta = new Date();
        eta.setDate(eta.getDate() + (input.shippingSpeed === 'express' ? 1 : 3));
        const order: Order = {
          ...input,
          id: input.id ?? `ord_${Date.now()}`,
          number: makeOrderNumber(),
          createdAtISO: new Date().toISOString(),
          status: 'paid',
          carrier: null,
          trackingCode: null,
          estimatedDeliveryISO: eta.toISOString(),
        };
        setOrders((cur) => [order, ...cur]);
        return order;
      },
      refresh,
    }),
    [orders, loading, user?.id]
  );

  return <OrdersContext.Provider value={api}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
