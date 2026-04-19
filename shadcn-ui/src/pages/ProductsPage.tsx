import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, SlidersHorizontal, Heart, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cart } from '@/lib/cart';
import { toast } from 'sonner';

type Product = {
  id: string; name: string; slug: string; description: string | null;
  categoryId: string; basePrice: number; coverImage: string | null;
  isFeatured: boolean; isNewArrival: boolean; isBestSeller: boolean;
  variants: { id: string; price: number | null; stock: number }[];
};
type Category = { id: string; name: string; slug: string; children: Category[] };

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }
function resolveImage(src?: string | null) {
  if (!src) return '/assets/placeholder.jpg';
  if (src.startsWith('http') || src.startsWith('/assets') || src.startsWith('/images')) return src;
  if (src.startsWith('/uploads')) return `http://localhost:4000${src}`;
  return src;
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-56 w-full rounded-none" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const price = product.basePrice;
  const firstVariant = product.variants?.[0];
  const inStock = product.variants?.some((v) => v.stock > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstVariant || !inStock) return;
    cart.add({
      id: product.id, name: product.name, slug: product.slug,
      price: firstVariant.price ?? price,
      qty: 1, variantId: firstVariant.id,
      cover_image: resolveImage(product.coverImage),
      variantDetails: null,
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <Card className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          <img
            src={resolveImage(product.coverImage)}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNewArrival && <Badge className="bg-black text-white text-xs border-0">Nouveau</Badge>}
            {product.isBestSeller && <Badge className="bg-amber-500 text-white text-xs border-0">Best-seller</Badge>}
            {!inStock && <Badge className="bg-gray-500 text-white text-xs border-0">Épuisé</Badge>}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:underline">{product.name}</h3>
          <p className="font-bold text-base">{fmt(price)}</p>

          <Button
            className="w-full mt-3 bg-black hover:bg-gray-900 text-sm h-9"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            {inStock ? (
              <><ShoppingCart className="mr-2 h-4 w-4" /> Ajouter au panier</>
            ) : 'Épuisé'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

function FilterPanel({
  categories, allCategories, selectedCategory, onCategoryChange,
  priceRange, maxPrice, onPriceChange, onReset,
}: {
  categories: Category[];
  allCategories: Category[];
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  priceRange: [number, number];
  maxPrice: number;
  onPriceChange: (v: [number, number]) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Catégories */}
      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Catégories</h3>
        <div className="space-y-1">
          <button
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
            onClick={() => onCategoryChange('')}
          >
            Tous les produits
          </button>
          {allCategories.map((c) => (
            <button
              key={c.id}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === c.slug ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              onClick={() => onCategoryChange(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Prix */}
      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Prix</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={1000}
          value={priceRange}
          onValueChange={(v) => onPriceChange(v as [number, number])}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{fmt(priceRange[0])}</span>
          <span>{fmt(priceRange[1])}</span>
        </div>
      </div>

      <Separator />

      <Button variant="outline" size="sm" className="w-full" onClick={onReset}>
        <X className="mr-2 h-4 w-4" /> Réinitialiser les filtres
      </Button>
    </div>
  );
}

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lire les params URL à l'initialisation
  const initParams = new URLSearchParams(location.search);
  const initQ        = initParams.get('q') || '';
  const initCat      = initParams.get('category') || '';
  const initFilter   = initParams.get('filter') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initQ);
  const [searchInput, setSearchInput] = useState(initQ);
  const [selectedCategory, setSelectedCategory] = useState(initCat);
  const [activeFilter, setActiveFilter] = useState(initFilter);
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [maxPrice, setMaxPrice] = useState(200000);

  // Synchro URL → state quand on navigue depuis le header
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const q = p.get('q') || '';
    const cat = p.get('category') || '';
    const f = p.get('filter') || '';
    setSearch(q);
    setSearchInput(q);
    setSelectedCategory(cat);
    setActiveFilter(f);
  }, [location.search]);

  // Mettre à jour l'URL quand les filtres changent (hors premier rendu)
  const updateUrl = useCallback((q: string, cat: string, f: string) => {
    const p = new URLSearchParams();
    if (q)   p.set('q', q);
    if (cat) p.set('category', cat);
    if (f)   p.set('filter', f);
    const qs = p.toString();
    navigate(qs ? `?${qs}` : '/products', { replace: true });
  }, [navigate]);

  const loadProducts = useCallback(async (q: string, category: string, filter: string) => {
    setLoading(true);
    try {
      const url = new URL('/api/products', window.location.origin);
      if (q)        url.searchParams.set('q', q);
      if (category) url.searchParams.set('categorySlug', category);
      if (filter)   url.searchParams.set('filter', filter);
      url.searchParams.set('limit', '100');

      const data = await fetch(url.toString()).then((r) => r.json());
      const prods = data.products || [];
      setProducts(prods);

      const max = Math.max(...prods.map((p: Product) => p.basePrice), 10000);
      const roundedMax = Math.ceil(max / 5000) * 5000;
      setMaxPrice(roundedMax);
      setPriceRange([0, roundedMax]);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Debounce searchInput → search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Déclencher le fetch quand search / category / filter changent
  useEffect(() => {
    loadProducts(search, selectedCategory, activeFilter);
    updateUrl(search, selectedCategory, activeFilter);
  }, [search, selectedCategory, activeFilter, loadProducts, updateUrl]);

  // Flatten categories
  const allCategories = useMemo(() => {
    const flat: Category[] = [];
    const f = (cats: Category[]) => { for (const c of cats) { flat.push(c); if (c.children?.length) f(c.children); } };
    f(categories);
    return flat;
  }, [categories]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setActiveFilter('');
  };

  // Filtrer prix + trier côté client (la recherche/catégorie/filter est déjà faite côté serveur)
  const filtered = useMemo(() => {
    let list = products.filter((p) => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]);
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.basePrice - a.basePrice);
    return list;
  }, [products, priceRange, sort]);

  const title = activeFilter === 'new' ? 'Nouveautés'
    : activeFilter === 'featured' ? 'Produits Vedettes'
    : selectedCategory
      ? allCategories.find((c) => c.slug === selectedCategory)?.name || 'Produits'
      : search ? `Résultats pour "${search}"` : 'Tous les produits';

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCategory('');
    setActiveFilter('');
    setPriceRange([0, maxPrice]);
    setSort('newest');
  };

  const metaTitle = activeFilter === 'new' ? 'Nouveautés Mode Féminine — Samani World Dakar'
    : activeFilter === 'featured' ? 'Produits Vedettes — Samani World Dakar'
    : search ? `Résultats pour "${search}" — Samani World`
    : 'Tous nos Produits — Robes, Abayas, Sacs | Samani World Sénégal';

  const metaDesc = activeFilter === 'new'
    ? 'Découvrez les dernières nouveautés de Samani World : robes, abayas et accessoires. Livraison partout au Sénégal.'
    : 'Parcourez toute la collection Samani World — robes, abayas, sacs, chaussures. Livraison à Dakar et dans toutes les régions du Sénégal.';

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href="https://samaniworld.com/products" />
      </Helmet>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filtres (desktop) */}
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel
            categories={categories}
            allCategories={allCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            maxPrice={maxPrice}
            onPriceChange={setPriceRange}
            onReset={resetFilters}
          />
        </aside>

        {/* Contenu */}
        <div className="flex-1">
          {/* En-tête + controls */}
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>{title}</h1>
              {!loading && <p className="text-sm text-gray-500 mt-1">{filtered.length} produit(s)</p>}
            </div>

            <div className="flex items-center gap-2">
              {/* Filtres mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader className="mb-6"><SheetTitle>Filtres</SheetTitle></SheetHeader>
                  <FilterPanel
                    categories={categories}
                    allCategories={allCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    priceRange={priceRange}
                    maxPrice={maxPrice}
                    onPriceChange={setPriceRange}
                    onReset={resetFilters}
                  />
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récents</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Rechercher un produit..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                onClick={() => setSearchInput('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Grille produits */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map((i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">Aucun produit trouvé</p>
              <Button variant="outline" onClick={resetFilters}>Réinitialiser les filtres</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
