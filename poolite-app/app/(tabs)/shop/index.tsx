import { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PooliteLogo } from '../../../src/components/PooliteLogo';
import { WaveDivider } from '../../../src/components/WaveDivider';
import { Card } from '../../../src/components/Card';
import { CartButton } from '../../../src/components/shop/CartButton';
import { BannerCarousel } from '../../../src/components/shop/BannerCarousel';
import { CategoryTile } from '../../../src/components/shop/CategoryTile';
import { NeedNowCard } from '../../../src/components/shop/NeedNowCard';
import { DealCardRated } from '../../../src/components/shop/DealCardRated';
import { CatalogCard } from '../../../src/components/shop/CatalogCard';
import { PressableScale } from '../../../src/components/PressableScale';
import { colors } from '../../../src/theme/colors';
import { useCatalog } from '../../../src/hooks/useCatalog';
import { useWaterState } from '../../../src/hooks/useWaterState';
import { CATEGORIES, ProductCategory, starString, isOutOfStock } from '../../../src/data/products';
import { TECHNICIANS } from '../../../src/data/technicians';
import { useWishlist } from '../../../src/state/WishlistContext';
import { router } from 'expo-router';

const WHY_BY_ID: Record<string, string> = {
  shock: '💡 Hai detto che l’acqua è verdina: serve un trattamento shock, subito.',
  floc: '💡 Acqua torbida: il flocculante la fa tornare limpida in una notte.',
  cloro5: '💡 Al ritmo dei tuoi trattamenti, il cloro finisce tra 12 giorni. E oggi è in offerta.',
};

type SortKey = 'rilevanza' | 'prezzo-asc' | 'prezzo-desc' | 'rating' | 'venduti';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'rilevanza', label: 'Rilevanza' },
  { id: 'venduti', label: 'Più venduti' },
  { id: 'prezzo-asc', label: 'Prezzo ↑' },
  { id: 'prezzo-desc', label: 'Prezzo ↓' },
  { id: 'rating', label: 'Recensioni' },
];

/** Forgiving match: ignores accents and case, so "antialghe" finds "Antialghe". */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export default function ShopHome() {
  const { products, loading } = useCatalog();
  const { urgent, cloudy, allOk } = useWaterState();
  const wishlist = useWishlist();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [sort, setSort] = useState<SortKey>('rilevanza');
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const needNowIds = urgent ? ['shock', 'antialghe'] : cloudy ? ['floc'] : ['cloro5'];
  const needNow = needNowIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  const deals = products.filter((p) => p.old);

  const catalogo = useMemo(() => {
    const q = normalize(search.trim());
    const list = products.filter((p) => {
      if (q && !normalize(p.name).includes(q) && !normalize(p.badge).includes(q) && !normalize(p.desc).includes(q)) return false;
      if (category && p.cat !== category) return false;
      if (onlyDeals && !p.old) return false;
      if (onlyAvailable && isOutOfStock(p)) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case 'prezzo-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'prezzo-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'venduti':
        sorted.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
        break;
      default:
        // Relevance: available first, then discounted, then best sellers.
        sorted.sort((a, b) => {
          const avail = Number(isOutOfStock(a)) - Number(isOutOfStock(b));
          if (avail !== 0) return avail;
          const deal = Number(!!b.old) - Number(!!a.old);
          if (deal !== 0) return deal;
          return (b.sold ?? 0) - (a.sold ?? 0);
        });
    }
    return sorted;
  }, [products, search, category, sort, onlyDeals, onlyAvailable]);

  const activeCategory = CATEGORIES.find((c) => c.id === category);
  const filtersActive = onlyDeals || onlyAvailable || sort !== 'rilevanza';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <PooliteLogo height={26} />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={{ fontSize: 14 }}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cerca nel catalogo Rio…"
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <PressableScale haptic={false} onPress={() => setSearch('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </PressableScale>
            )}
          </View>
          <PressableScale scaleTo={0.93} onPress={() => router.push('/preferiti')} style={styles.iconBtn}>
            <Text style={{ fontSize: 17 }}>{wishlist.count > 0 ? '❤️' : '🤍'}</Text>
            {wishlist.count > 0 && (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>{wishlist.count}</Text>
              </View>
            )}
          </PressableScale>
          <CartButton />
        </View>

        <WaveDivider style={{ paddingVertical: 12 }} />

        <BannerCarousel />

        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => (
            <CategoryTile
              key={c.id}
              label={c.label}
              image={c.image}
              active={category === c.id}
              onPress={() => setCategory((cur) => (cur === c.id ? null : c.id))}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Ti serve ora</Text>
        {allOk ? (
          <Card tone="selected" style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={styles.allOkText}>Nessuna urgenza oggi: la tua piscina è in ordine 👌</Text>
          </Card>
        ) : (
          <View style={styles.urgentBanner}>
            <Text style={{ fontSize: 20 }}>⚠️</Text>
            <Text style={styles.urgentText}>L’acqua ha bisogno di una mano oggi. Bastano questi due, nell’ordine.</Text>
          </View>
        )}
        <View style={{ gap: 12, marginTop: 10 }}>
          {needNow.map((p) => (
            <NeedNowCard key={p.id} product={p} why={WHY_BY_ID[p.id] ?? p.badge} urgent={urgent} />
          ))}
        </View>

        <View style={styles.dealsHeader}>
          <Text style={styles.dealsTitle}>SCOPRI LE OFFERTE</Text>
          <Text style={styles.dealsTag}>esclusive Poolite ✨</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsRow}>
          {deals.map((p) => (
            <DealCardRated key={p.id} product={p} />
          ))}
        </ScrollView>

        <View style={styles.techHeaderRow}>
          <Text style={styles.sectionTitle}>Tecnici di zona</Text>
          <Text onPress={() => router.push('/(tabs)/shop/tecnici')} style={styles.techLink}>
            Vedi tutti ›
          </Text>
        </View>
        <PressableScale scaleTo={0.98} onPress={() => router.push('/(tabs)/shop/tecnici')}>
          <Card soft style={{ marginTop: 10 }}>
            <View style={styles.techRow}>
              <Text style={{ fontSize: 28 }}>{TECHNICIANS[0].emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.techName} numberOfLines={1}>{TECHNICIANS[0].name}</Text>
                <Text style={styles.techMeta}>
                  <Text style={{ color: colors.accent }}>{starString(TECHNICIANS[0].rating)}</Text> {TECHNICIANS[0].rating.toFixed(1).replace('.', ',')} ·{' '}
                  {TECHNICIANS[0].specialty}
                </Text>
                <Text style={styles.techSub}>+{TECHNICIANS.length - 1} altri professionisti verificati vicino a te · richiesta gratuita</Text>
              </View>
              <Text style={styles.techChevron}>›</Text>
            </View>
          </Card>
        </PressableScale>

        <View style={styles.catalogHeader}>
          <Text style={styles.sectionTitle}>{activeCategory ? activeCategory.label : 'Dal catalogo Rio'}</Text>
          <PressableScale haptic={false} onPress={() => setShowFilters((v) => !v)}>
            <Text style={[styles.filterToggle, filtersActive && { color: colors.amber }]}>
              ⚙ Filtri{filtersActive ? ' •' : ''}
            </Text>
          </PressableScale>
        </View>

        {showFilters && (
          <Card soft style={{ marginTop: 10 }}>
            <Text style={styles.filterGroupLabel}>ORDINA PER</Text>
            <View style={styles.chipWrap}>
              {SORTS.map((s) => (
                <PressableScale
                  key={s.id}
                  haptic={false}
                  onPress={() => setSort(s.id)}
                  style={[styles.chip, sort === s.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                >
                  <Text style={[styles.chipText, sort === s.id && { color: '#FFFFFF' }]}>{s.label}</Text>
                </PressableScale>
              ))}
            </View>
            <Text style={[styles.filterGroupLabel, { marginTop: 14 }]}>MOSTRA SOLO</Text>
            <View style={styles.chipWrap}>
              <PressableScale
                haptic={false}
                onPress={() => setOnlyDeals((v) => !v)}
                style={[styles.chip, onlyDeals && { backgroundColor: colors.amberBg, borderColor: colors.amber }]}
              >
                <Text style={[styles.chipText, onlyDeals && { color: colors.amber }]}>🏷 In offerta</Text>
              </PressableScale>
              <PressableScale
                haptic={false}
                onPress={() => setOnlyAvailable((v) => !v)}
                style={[styles.chip, onlyAvailable && { backgroundColor: colors.selectedBg, borderColor: colors.accent }]}
              >
                <Text style={[styles.chipText, onlyAvailable && { color: colors.primary }]}>✓ Disponibili</Text>
              </PressableScale>
              {activeCategory && (
                <PressableScale haptic={false} onPress={() => setCategory(null)} style={styles.chip}>
                  <Text style={[styles.chipText, { color: colors.error }]}>✕ {activeCategory.label}</Text>
                </PressableScale>
              )}
            </View>
          </Card>
        )}

        <Text style={styles.resultCount}>
          {catalogo.length} {catalogo.length === 1 ? 'prodotto' : 'prodotti'}
          {search ? ` per “${search}”` : ''}
        </Text>
        <View style={styles.catalogGrid}>
          {catalogo.map((p) => (
            <View key={p.id} style={{ width: '48%' }}>
              <CatalogCard product={p} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingBottom: 120 },
  logoRow: { alignItems: 'center', paddingVertical: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, height: 42 },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  clearSearch: { fontSize: 14, color: colors.textSecondary, paddingHorizontal: 4 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  iconBadge: { position: 'absolute', top: -5, right: -5, minWidth: 19, height: 19, borderRadius: 10, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  iconBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  filterToggle: { fontSize: 13, fontWeight: '800', color: colors.accent },
  filterGroupLabel: { fontSize: 10, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: colors.card },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  resultCount: { fontSize: 12, color: colors.textSecondary, marginTop: 10, paddingHorizontal: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 6 },
  sectionTitle: { fontWeight: '800', fontSize: 16, color: colors.textPrimary, paddingHorizontal: 4 },
  allOkText: { fontWeight: '800', fontSize: 15, color: colors.primary },
  urgentBanner: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: 20, padding: 14, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  urgentText: { flex: 1, fontSize: 13, color: colors.errorText, fontWeight: '700', lineHeight: 18 },
  dealsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 20, paddingHorizontal: 4 },
  dealsTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary, letterSpacing: 0.5 },
  dealsTag: { fontSize: 12, fontWeight: '800', color: colors.amber },
  dealsRow: { gap: 10, paddingVertical: 10, paddingHorizontal: 2 },
  techHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 18, paddingHorizontal: 4 },
  techLink: { fontSize: 13, color: colors.accent, fontWeight: '700' },
  techRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  techName: { fontWeight: '800', fontSize: 14, color: colors.textPrimary },
  techMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  techSub: { fontSize: 12, color: colors.accent, fontWeight: '600', marginTop: 3 },
  techChevron: { color: colors.accent, fontWeight: '800', fontSize: 18 },
  catalogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 18, paddingHorizontal: 4 },
  clearCat: { fontSize: 12, color: colors.accent, fontWeight: '800' },
  catalogGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
});
