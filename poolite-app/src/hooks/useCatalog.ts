import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS, Product, ProductCategory } from '../data/products';

/**
 * Product catalog, Supabase-backed when configured (table `products`, seeded by
 * supabase/migrations/0002_seed_products.sql) and falling back to the local
 * mock catalog otherwise, so the Shop tab works before the backend exists.
 */
export function useCatalog() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!cancelled && !error && data && data.length > 0) {
        setProducts(
          data.map((r: any) => ({
            id: r.id,
            cat: r.category as ProductCategory,
            rating: r.rating,
            name: r.name,
            emoji: r.emoji,
            price: Number(r.price),
            old: r.old_price != null ? Number(r.old_price) : null,
            badge: r.badge,
            desc: r.description,
          }))
        );
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  return { products, byId, loading };
}
