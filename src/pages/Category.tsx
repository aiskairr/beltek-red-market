import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/hooks/use-cart';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';

const categoryNames: Record<string, string> = {
  'all': 'Все товары',
  'refrigerators': 'Холодильники',
  'washing-machines': 'Стиральные машины',
  'tvs': 'Телевизоры',
  'kitchen': 'Кухонная техника',
  'air-conditioners': 'Кондиционеры',
  'vacuum-cleaners': 'Пылесосы',
};

const categoryImages: Record<string, string> = {
  'all': '/all-appliances.jpg',
  'refrigerators': '/category-refrigerators.jpg',
  'washing-machines': '/category-washing-machines.jpg',
  'tvs': '/category-tvs.jpg',
  'kitchen': '/category-kitchen.jpg',
  'air-conditioners': '/category-air-conditioners.jpg',
  'vacuum-cleaners': '/category-vacuum-cleaners.jpg',
};

const ITEMS_PER_PAGE = 9;

const Category = () => {
  const { categorySlug = 'all', subCategorySlug } = useParams<{ categorySlug: string, subCategorySlug: string }>();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch brands from Supabase
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setBrands(data || []);
      } catch (err) {
        console.error('Ошибка загрузки брендов:', err);
        setError('Ошибка загрузки брендов');
      }
    };

    fetchBrands();
  }, []);

  // Fetch products from Supabase with pagination
  const fetchProducts = async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      // Фильтрация по категории
      if (categorySlug && categorySlug !== "all") {
        query = query.eq("category", categorySlug);
      }

      // Фильтрация по подкатегории (если есть)
      if (subCategorySlug) {
        query = query.eq("mini_category", subCategorySlug);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const newProducts = data || [];

      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
        setAllProducts(newProducts);

        // Calculate min and max prices from first batch
        if (newProducts.length > 0) {
          const prices = newProducts.map(product => product.price);
          const minPriceValue = Math.min(...prices);
          const maxPriceValue = Math.max(...prices);
          setMinPrice(minPriceValue);
          setMaxPrice(maxPriceValue);
          setPriceRange([minPriceValue, maxPriceValue]);
        }
      }

      // Check if there are more items to load
      setHasMore(newProducts.length === ITEMS_PER_PAGE);

    } catch (err: any) {
      console.error("Ошибка загрузки товаров:", err.message);
      setError(`Ошибка загрузки товаров: ${err.message}`);
      setProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    setPage(0);
    setProducts([]);
    setAllProducts([]);
    setHasMore(true);
    fetchProducts(0, false);

  }, [categorySlug, subCategorySlug]);


  // Load more products
  const loadMoreProducts = async () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchProducts(nextPage, true);
    }
  };

  // Apply filters and sorting to currently loaded products
  useEffect(() => {
    let result = [...products];

    // Filter by brand
    if (selectedBrands.length > 0) {
      result = result.filter(product => selectedBrands.includes(product.brand));
    }

    // Filter by price range
    result = result.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // No specific sorting for featured
        break;
    }

    setFilteredProducts(result);
  }, [products, selectedBrands, priceRange, sortBy]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // Get available brands from current products
  const availableBrandNames = Array.from(new Set(products.map(product => product.brand)));
  const availableBrands = brands.filter(brand => availableBrandNames.includes(brand.name));

  const resetFilters = () => {
    setSelectedBrands([]);
    setPriceRange([minPrice, maxPrice]);
    setSortBy('featured');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-lg">Загрузка товаров...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">⚠️ Произошла ошибка</div>
            <div className="text-gray-700">{error}</div>
            <button
              onClick={() => {
                setError(null);
                setPage(0);
                fetchProducts(0, false);
              }}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative mb-4 h-40 overflow-hidden rounded-lg">

            <div className="absolute inset-0 bg-opacity-90 flex items-center justify-center" style={{ background: "rgb(227 6 19 / var(--tw-bg-opacity, 1))" }}>
              <h1 className="text-3xl font-bold text-white text-center px-4">
                {categorySlug === "all"
                  ? "Товары"
                  : subCategorySlug
                    ? `${categorySlug} / ${subCategorySlug}`
                    : categorySlug
                }
              </h1>

            </div>
          </div>
          <p className="text-gray-600">
            Показано товаров: {filteredProducts.length}
            {products.length > 0 && ` из ${products.length} загруженных`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-white rounded-lg shadow divide-y">
              {/* Price Range */}
              <div className="p-4">
                <h3 className="font-medium mb-4">Цена</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    min={minPrice}
                    max={maxPrice}
                    step={1000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{priceRange[0].toLocaleString()} с</span>
                    <span>{priceRange[1].toLocaleString()} с</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="p-4">
                <h3 className="font-medium mb-4">Бренд</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableBrands.map(brand => (
                    <div key={brand.id} className="flex items-center">
                      <Checkbox
                        id={`brand-${brand.id}`}
                        checked={selectedBrands.includes(brand.name)}
                        onCheckedChange={() => handleBrandToggle(brand.name)}
                      />
                      <Label htmlFor={`brand-${brand.id}`} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {brand.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="lg:w-3/4">
            {/* Sort and Filter Controls */}
            <div className="flex justify-between items-center mb-6">
              <button
                className="lg:hidden flex items-center gap-2 text-sm font-medium bg-white py-2 px-3 rounded border"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                Фильтры
              </button>

              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm mr-2 hidden sm:inline">Сортировать по:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm py-2"
                >
                  <option value="featured">По умолчанию</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                  <option value="name-asc">По названию</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            {mobileFiltersOpen && (
              <div className="bg-white rounded-lg shadow mb-6 p-4 lg:hidden">
                <h3 className="font-medium mb-4">Фильтры</h3>
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Цена</h4>
                  <div className="px-2">
                    <Slider
                      defaultValue={[minPrice, maxPrice]}
                      min={minPrice}
                      max={maxPrice}
                      step={1000}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{priceRange[0].toLocaleString()} с</span>
                      <span>{priceRange[1].toLocaleString()} с</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3">Бренд</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                      <div key={brand.id} className="flex items-center">
                        <Checkbox
                          id={`mobile-brand-${brand.id}`}
                          checked={selectedBrands.includes(brand.name)}
                          onCheckedChange={() => handleBrandToggle(brand.name)}
                        />
                        <Label htmlFor={`mobile-brand-${brand.id}`} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate">
                          {brand.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={loadMoreProducts}
                      disabled={loadingMore}
                      style={{backgroundColor: "#E30613"}} className="text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Загрузка...
                        </>
                      ) : (
                        'Показать ещё'
                      )}
                    </button>
                  </div>
                )}

                {!hasMore && products.length > ITEMS_PER_PAGE && (
                  <div className="text-center text-gray-500 py-4">
                    Все товары загружены
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-4">Попробуйте изменить параметры фильтрации</p>
                <button
                  onClick={resetFilters}
                  className="primary-button"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category;