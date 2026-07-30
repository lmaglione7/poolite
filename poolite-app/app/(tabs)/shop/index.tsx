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
import { colors } from '../../../src/theme/colors';
import { useCatalog } from '../../../src/hooks/useCatalog';
import { useWaterState } from '../../../src/hooks/useWaterState';
import { CATEGORIES, ProductCategory } from '../../../src/data/products';

const WHY_BY_ID: Record<string, string> = {
  shock: '💡 Hai detto che l’acqua è verdina: serve un trattamento shock, subito.',
  floc: '💡 Acqua torbida: il flocculante la fa tornare limpida in una notte.',
  cloro5: '💡 Al ritmo dei tuoi trattamenti, il cloro finisce tra 12 giorni. E oggi è in offerta.',
};

export default function ShopHome() {
  const { products, loading } = useCatalog();
  const { urgent, cloudy, allOk } = useWaterState();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | null>(null);

  const needNowIds = urgent ? ['shock', 'antialghe'] : cloudy ? ['floc'] : ['cloro5'];
  const needNow = needNowIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  const deals = products.filter((p) => p.old);

  const catalogo = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => (!q || p.name.toLowerCase().includes(q)) && (!category || p.cat === category));
  }, [products, search, category]);

  const activeCategory = CATEGORIES.find((c) => c.id === category);

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
            />
          </View>
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

        <View style={styles.catalogHeader}>
          <Text style={styles.sectionTitle}>{activeCategory ? activeCategory.label : 'Dal catalogo Rio'}</Text>
          {activeCategory && (
            <Text onPress={() => setCategory(null)} style={styles.clearCat}>
              ✕ mostra tutto
            </Text>
          )}
        </View>
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
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 6 },
  sectionTitle: { fontWeight: '800', fontSize: 16, color: colors.textPrimary, paddingHorizontal: 4 },
  allOkText: { fontWeight: '800', fontSize: 15, color: colors.primary },
  urgentBanner: { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: 20, padding: 14, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  urgentText: { flex: 1, fontSize: 13, color: colors.errorText, fontWeight: '700', lineHeight: 18 },
  dealsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 20, paddingHorizontal: 4 },
  dealsTitle: { fontWeight: '800', fontSize: 15, color: colors.textPrimary, letterSpacing: 0.5 },
  dealsTag: { fontSize: 12, fontWeight: '800', color: colors.amber },
  dealsRow: { gap: 10, paddingVertical: 10, paddingHorizontal: 2 },
  catalogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 18, paddingHorizontal: 4 },
  clearCat: { fontSize: 12, color: colors.accent, fontWeight: '800' },
  catalogGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
});
