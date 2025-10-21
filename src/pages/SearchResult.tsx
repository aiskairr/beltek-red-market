import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useMoySkladProducts } from '@/hooks/useProduct';
import { useMoySkladCategories } from '@/hooks/useCategories';
import { useMoySkladBrands } from '@/hooks/useBrands';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Fetch data using MoySklad hooks
  const { data: productsData, isLoading } = useMoySkladProducts({
    searchTerm: searchQuery,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  }, 100, 1);

  const { data: categories = [] } = useMoySkladCategories();
  const { data: brands = [] } = useMoySkladBrands();

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = productsData?.products || [];

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // relevance - keep original order
        break;
    }

    return filtered;
  }, [productsData, selectedBrands, selectedCategories, sortBy]);

  // Get available brands and categories from search results
  const availableBrands = useMemo(() => {
    const brandSet = new Set((productsData?.products || []).map(p => p.brand).filter(Boolean));
    return brands.filter(b => brandSet.has(b.name));
  }, [productsData, brands]);

  const availableCategories = useMemo(() => {
    const catSet = new Set((productsData?.products || []).map(p => p.category).filter(Boolean));
    return categories.filter(c => catSet.has(c.category));
  }, [productsData, categories]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange([0, 5000000]);
    setSortBy('relevance');
  };

  if (!searchQuery.trim()) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-600 mb-2">⚠️ Пустой поисковый запрос</div>
            <div className="text-gray-700">Введите поисковый запрос для поиска товаров</div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-lg">Поиск товаров...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative mb-4 h-40 overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-opacity-90 flex items-center justify-center" style={{ background: "rgb(227 6 19 / var(--tw-bg-opacity, 1))" }}>
              <h1 className="text-3xl font-bold text-white text-center px-4">
                Результаты поиска: "{searchQuery}"
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            Найдено товаров: {filteredProducts.length}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-white rounded-lg shadow divide-y">
              <div className="p-4">
                <h3 className="font-medium mb-4">Цена</h3>
                <div className="px-2">
                  <Slider
                    min={0}
                    max={5000000}
                    step={10000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm mb-3">
                    <span>{priceRange[0].toLocaleString()} с</span>
                    <span>{priceRange[1].toLocaleString()} с</span>
                  </div>
                </div>
              </div>

              {/* Category filter */}
              {availableCategories.length > 0 && (
                <div className="p-4">
                  <h3 className="font-medium mb-4">Категория</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCategories.map(category => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.category)}
                          onCheckedChange={() => handleCategoryToggle(category.category)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
                          {category.category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand filter */}
              {availableBrands.length > 0 && (
                <div className="p-4">
                  <h3 className="font-medium mb-4">Бренд</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                      <div key={brand.id} className="flex items-center">
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={selectedBrands.includes(brand.name)}
                          onCheckedChange={() => handleBrandToggle(brand.name)}
                        />
                        <Label htmlFor={`brand-${brand.id}`} className="ml-2 text-sm">
                          {brand.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm mr-2 hidden sm:inline">Сортировать по:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="relevance">По релевантности</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                  <option value="name-asc">По названию</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-4">
                  По запросу "{searchQuery}" ничего не найдено.
                </p>
                <button onClick={resetFilters} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
