import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/hooks/use-cart';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';

const PRODUCTS_PER_PAGE = 9;

// Типы для брендов и категорий
interface Brand {
  id: string;
  name: string;
}

interface Category {
  id?: string;
  name: string;
  slug: string;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Состояние для доступных брендов и категорий в результатах поиска
  const [availableBrandsInResults, setAvailableBrandsInResults] = useState<string[]>([]);
  const [availableCategoriesInResults, setAvailableCategoriesInResults] = useState<string[]>([]);
  
  // Разделяем состояния для цены
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 200000]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced функция для применения фильтра по цене
  const applyPriceFilter = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setPriceRange(tempPriceRange);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [tempPriceRange]);

  // Применяем фильтр по цене с задержкой
  useEffect(() => {
    const cleanup = applyPriceFilter();
    return cleanup;
  }, [applyPriceFilter]);

  // Функция для создания поискового запроса
  const buildSearchQuery = (baseQuery: any) => {
    if (!searchQuery.trim()) return baseQuery;

    // Поиск по названию, описанию, бренду и категории
    return baseQuery.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
  };

  // Получение доступных брендов и категорий для результатов поиска
  const fetchAvailableFilters = async () => {
    try {
      let filterQuery = supabase
        .from("products")
        .select("brand, category");

      filterQuery = buildSearchQuery(filterQuery);

      const { data: filterData, error: filterError } = await filterQuery;
      
      if (filterError) throw filterError;

      if (filterData && filterData.length > 0) {
        // Получаем уникальные бренды
        const uniqueBrands = Array.from(new Set(filterData.map(product => product.brand))).filter(Boolean);
        setAvailableBrandsInResults(uniqueBrands);
        
        // Получаем уникальные категории
        const uniqueCategories = Array.from(new Set(filterData.map(product => product.category))).filter(Boolean);
        setAvailableCategoriesInResults(uniqueCategories);
      } else {
        setAvailableBrandsInResults([]);
        setAvailableCategoriesInResults([]);
      }

    } catch (err: any) {
      console.error("Ошибка получения фильтров для поиска:", err.message);
      setAvailableBrandsInResults([]);
      setAvailableCategoriesInResults([]);
    }
  };

  const fetchProductsInfo = async () => {
    try {
      // Получаем все товары без фильтра по цене для определения диапазона
      let priceQuery = supabase
        .from("products")
        .select("price");

      priceQuery = buildSearchQuery(priceQuery);

      // Применяем фильтры по бренду и категории для диапазона цен
      if (selectedBrands.length > 0) {
        priceQuery = priceQuery.in("brand", selectedBrands);
      }

      if (selectedCategories.length > 0) {
        priceQuery = priceQuery.in("category", selectedCategories);
      }

      const { data: priceData, error: priceError } = await priceQuery;
      
      if (priceError) throw priceError;

      // Устанавливаем диапазон цен
      if (priceData && priceData.length > 0) {
        const prices = priceData.map(product => product.price);
        const minPriceValue = Math.min(...prices);
        const maxPriceValue = Math.max(...prices);
        setMinPrice(minPriceValue);
        setMaxPrice(maxPriceValue);
        
        // Устанавливаем начальные значения только при первом поиске
        if (priceRange[0] === 0 && priceRange[1] === 200000) {
          setPriceRange([minPriceValue, maxPriceValue]);
          setTempPriceRange([minPriceValue, maxPriceValue]);
        }
      }

      // Получаем количество с учетом всех фильтров включая цену
      let countQuery = supabase
        .from("products")
        .select("*", { count: 'exact', head: true });

      countQuery = buildSearchQuery(countQuery);

      // Применяем все фильтры для подсчета
      if (selectedBrands.length > 0) {
        countQuery = countQuery.in("brand", selectedBrands);
      }

      if (selectedCategories.length > 0) {
        countQuery = countQuery.in("category", selectedCategories);
      }

      countQuery = countQuery
        .gte("price", priceRange[0])
        .lte("price", priceRange[1]);

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;

      setTotalCount(count || 0);

    } catch (err: any) {
      console.error("Ошибка получения информации о товарах:", err.message);
    }
  };

  // Загрузка товаров с пагинацией
  const fetchProducts = async (page: number = 0, reset: boolean = false) => {
    try {
      if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      let query = supabase
        .from("products")
        .select("*")
        .range(page * PRODUCTS_PER_PAGE, (page + 1) * PRODUCTS_PER_PAGE - 1);

      query = buildSearchQuery(query);

      // Применяем фильтры
      if (selectedBrands.length > 0) {
        query = query.in("brand", selectedBrands);
      }

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories);
      }

      query = query
        .gte("price", priceRange[0])
        .lte("price", priceRange[1]);

      // Сортировка
      switch (sortBy) {
        case 'price-asc':
          query = query.order("price", { ascending: true });
          break;
        case 'price-desc':
          query = query.order("price", { ascending: false });
          break;
        case 'name-asc':
          query = query.order("name", { ascending: true });
          break;
        case 'relevance':
        default:
          // Для релевантности можно использовать текстовый поиск или сортировку по дате
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      const newProducts = data || [];
      
      if (reset || page === 0) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
      setCurrentPage(page);
      
      console.log(`Загружено товаров на странице ${page}:`, newProducts.length);

    } catch (err: any) {
      console.error("Ошибка загрузки товаров:", err.message);
      setError(`Ошибка загрузки товаров: ${err.message}`);
      if (reset || page === 0) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Загрузка брендов и категорий
  useEffect(() => {
    const fetchBrandsAndCategories = async () => {
      try {
        // Загружаем бренды
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .order('name');
        if (brandsError) throw brandsError;
        setBrands(brandsData || []);

        // Загружаем категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
        
      } catch (err) {
        console.error('Ошибка загрузки брендов и категорий:', err);
      }
    };
    fetchBrandsAndCategories();
  }, []);

  // Инициализация поиска при изменении поискового запроса
  useEffect(() => {
    if (searchQuery.trim()) {
      // Сбрасываем состояние
      setProducts([]);
      setCurrentPage(0);
      setHasMore(true);
      setSelectedBrands([]);
      setSelectedCategories([]);
      
      // Загружаем доступные фильтры
      fetchAvailableFilters();
      
      // Сначала получаем информацию о товарах и диапазоне цен
      fetchProductsInfo().then(() => {
        // Затем загружаем товары
        fetchProducts(0, true);
      });
    }
  }, [searchQuery]);

  // Перезагрузка при изменении фильтров или сортировки
  useEffect(() => {
    if (searchQuery.trim()) {
      setProducts([]);
      setCurrentPage(0);
      setHasMore(true);
      fetchProducts(0, true);
      fetchProductsInfo();
    }
  }, [selectedBrands, selectedCategories, priceRange, sortBy]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(currentPage + 1);
    }
  };

  const handlePriceChange = (value: [number, number]) => {
    setTempPriceRange(value);
  };

  const applyPriceFilterNow = () => {
    setPriceRange(tempPriceRange);
  };

  // Фильтруем бренды и категории по тем, что доступны в результатах поиска
  const availableBrands = brands.filter(brand => availableBrandsInResults.includes(brand.name));
  const availableCategories = categories.filter(category => availableCategoriesInResults.includes(category.name));

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    const resetRange: [number, number] = [minPrice, maxPrice];
    setPriceRange(resetRange);
    setTempPriceRange(resetRange);
    setSortBy('relevance');
  };

  // Если нет поискового запроса
  if (!searchQuery.trim()) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-600 mb-2">⚠️ Пустой поисковый запрос</div>
            <div className="text-gray-700">Введите поисковый запрос для поиска товаров</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-lg">Поиск товаров...</div>
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
                fetchProducts(0, true);
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
                Результаты поиска: "{searchQuery}"
              </h1>
            </div>
          </div>
          
          <p className="text-gray-600">
            Найдено товаров: {products.length} из {totalCount}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Фильтры */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-white rounded-lg shadow divide-y">
              <div className="p-4">
                <h3 className="font-medium mb-4">Цена</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    min={minPrice}
                    max={maxPrice}
                    step={1000}
                    value={tempPriceRange}
                    onValueChange={handlePriceChange}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm mb-3">
                    <span>{tempPriceRange[0].toLocaleString()} с</span>
                    <span>{tempPriceRange[1].toLocaleString()} с</span>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>Мин: {minPrice.toLocaleString()} с</span>
                    <span>Макс: {maxPrice.toLocaleString()} с</span>
                  </div>
                  
                  {(tempPriceRange[0] !== priceRange[0] || tempPriceRange[1] !== priceRange[1]) && (
                    <button
                      onClick={applyPriceFilterNow}
                      className="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                    >
                      Применить
                    </button>
                  )}
                </div>
              </div>

              {/* Фильтр по категориям */}
              {availableCategories.length > 0 && (
                <div className="p-4">
                  <h3 className="font-medium mb-4">Категория</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableCategories.map(category => (
                      <div key={category.id} className="flex items-center">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => handleCategoryToggle(category.name)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Фильтр по брендам */}
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
                        <Label htmlFor={`brand-${brand.id}`} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {brand.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Товары */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <button
                className="lg:hidden flex items-center gap-2 text-sm font-medium bg-white py-2 px-3 rounded border"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
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
                  <option value="relevance">По релевантности</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                  <option value="name-asc">По названию</option>
                </select>
              </div>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Кнопка "Загрузить еще" */}
                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="primary-button inline-flex items-center gap-2 min-w-[200px] justify-center"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Загрузка...
                        </>
                      ) : (
                        'Загрузить еще'
                      )}
                    </button>
                  </div>
                )}
                
                {!hasMore && products.length > 0 && (
                  <div className="mt-8 text-center text-gray-500">
                    Больше товаров нет
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-4">
                  По запросу "{searchQuery}" ничего не найдено. Попробуйте изменить поисковый запрос или параметры фильтрации.
                </p>
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

export default SearchResults;