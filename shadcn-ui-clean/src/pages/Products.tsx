import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { products as allProducts } from '@/lib/products-data-v2';
import { getAllCategories } from '@/lib/categories-data';
import { productOptions, getOptionValuesByOptionId } from '@/lib/options-data';
import type { Product } from '@/lib/types';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  const categories = getAllCategories();
  const filterParam = searchParams.get('filter');

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by URL param (featured, new, bestseller)
    if (filterParam === 'featured') {
      filtered = filtered.filter((p) => p.isFeatured);
    } else if (filterParam === 'new') {
      filtered = filtered.filter((p) => p.isNewArrival);
    } else if (filterParam === 'bestseller') {
      filtered = filtered.filter((p) => p.isBestSeller);
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.categoryId));
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]
    );

    // Filter by stock (simplified - would need variant check in real app)
    if (inStockOnly) {
      filtered = filtered.filter((p) => p.isActive);
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => {
        const aScore = (a.isBestSeller ? 3 : 0) + (a.isFeatured ? 2 : 0) + (a.isNewArrival ? 1 : 0);
        const bScore = (b.isBestSeller ? 3 : 0) + (b.isFeatured ? 2 : 0) + (b.isNewArrival ? 1 : 0);
        return bScore - aScore;
      });
    }

    return filtered;
  }, [allProducts, searchQuery, filterParam, selectedCategories, priceRange, inStockOnly, sortBy]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedOptions({});
    setInStockOnly(false);
    setSearchParams({});
  };

  const activeFiltersCount =
    selectedCategories.length +
    (searchQuery ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    Object.values(selectedOptions).flat().length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Recherche</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Catégories</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <label
                htmlFor={`cat-${category.id}`}
                className="text-sm cursor-pointer hover:text-[#D4AF37]"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">
          Prix: {priceRange[0].toLocaleString('fr-FR')} - {priceRange[1].toLocaleString('fr-FR')} FCFA
        </Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          min={0}
          max={100000}
          step={5000}
          className="mt-2"
        />
      </div>

      {/* Size Filter */}
      {productOptions.find((o) => o.id === 'size') && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Taille</Label>
          <div className="flex flex-wrap gap-2">
            {getOptionValuesByOptionId('size').map((value) => {
              const isSelected = selectedOptions['size']?.includes(value.id);
              return (
                <Button
                  key={value.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className={isSelected ? 'bg-black hover:bg-gray-900' : ''}
                  onClick={() => {
                    setSelectedOptions((prev) => {
                      const current = prev['size'] || [];
                      return {
                        ...prev,
                        size: isSelected
                          ? current.filter((id) => id !== value.id)
                          : [...current, value.id],
                      };
                    });
                  }}
                >
                  {value.value}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Filter */}
      {productOptions.find((o) => o.id === 'color') && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Couleur</Label>
          <div className="flex flex-wrap gap-3">
            {getOptionValuesByOptionId('color').map((value) => {
              const isSelected = selectedOptions['color']?.includes(value.id);
              return (
                <button
                  key={value.id}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    isSelected ? 'border-black scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: value.colorHex }}
                  onClick={() => {
                    setSelectedOptions((prev) => {
                      const current = prev['color'] || [];
                      return {
                        ...prev,
                        color: isSelected
                          ? current.filter((id) => id !== value.id)
                          : [...current, value.id],
                      };
                    });
                  }}
                  title={value.displayValue || value.value}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <label htmlFor="inStock" className="text-sm cursor-pointer">
          En stock uniquement
        </label>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={clearFilters}
        >
          <X className="mr-2 h-4 w-4" />
          Effacer les filtres ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
            {filterParam === 'featured' && 'Produits Vedettes'}
            {filterParam === 'new' && 'Nouveautés'}
            {filterParam === 'bestseller' && 'Best-sellers'}
            {!filterParam && 'Tous les Produits'}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filtres</h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters & Sort */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récent</SelectItem>
                  <SelectItem value="popular">Populaire</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-4">
                  Aucun produit trouvé
                </p>
                <Button onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}