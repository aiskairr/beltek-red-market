import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { ProductCard } from '@/components/ProductCard';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Импортируем наши хуки
import { useCategories, useCategoriesWithMutations } from '@/hooks/useCategories';
import { useBrands, useBrandsWithMutations } from '@/hooks/useBrands';
import { useInfiniteProducts } from '@/hooks/useProduct';
import { ProductFilters } from '@/hooks/useProduct';

interface SubCategory {
  name: string;
  slug: string;
  count: number;
}

// Ключ для localStorage
const FILTERS_STORAGE_KEY = 'category_filters';

const Category = () => {
  const { categorySlug = 'all', subCategorySlug } = useParams<{
    categorySlug: string;
    subCategorySlug: string;
  }>();
  const navigate = useNavigate();

  // Загружаем данные через хуки
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: brands = [], isLoading: brandsLoading } = useBrands();

  // Локальные состояния для фильтров
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 200000]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Определяем текущую категорию
  const currentCategory = useMemo(() => {
    if (categorySlug === 'all') {
      return { id: 0, category: 'Все товары', mini_categories: [] };
    }

    const decodedSlug = decodeURIComponent(categorySlug);
    return categories.find(cat =>
      cat.category === decodedSlug ||
      cat.id.toString() === categorySlug
    ) || { id: 0, category: decodedSlug, mini_categories: [] };
  }, [categories, categorySlug]);

  // Создаем фильтры для продуктов
  const productFilters: ProductFilters = useMemo(() => {
    const filters: ProductFilters = {};

    if (categorySlug !== 'all' && currentCategory?.category) {
      filters.category = currentCategory.category;
    }

    if (subCategorySlug) {
      filters.mini_category = subCategorySlug;
    }

    if (selectedBrands.length > 0) {
      filters.brand = selectedBrands[0]; // API поддерживает только один бренд, можно расширить
    }

    if (priceRange[0] > 0 || priceRange[1] < 200000) {
      filters.minPrice = priceRange[0];
      filters.maxPrice = priceRange[1];
    }

    return filters;
  }, [categorySlug, currentCategory, subCategorySlug, selectedBrands, priceRange]);

  // Используем infinite scroll для продуктов
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
    error: productsError
  } = useInfiniteProducts(productFilters, 9); // 9 товаров на страницу как в оригинале

  // Получаем все продукты из всех страниц
  const products = useMemo(() => {
    return productsData?.pages.flatMap(page => page.products) || [];
  }, [productsData]);

  const totalCount = productsData?.pages[0]?.totalCount || 0;

  // Подкатегории из текущей категории
  const subCategories: SubCategory[] = useMemo(() => {
    if (!currentCategory?.mini_categories) return [];

    return currentCategory.mini_categories.map(name => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      count: 0 // Можно добавить подсчет, если нужно
    }));
  }, [currentCategory]);

  // Доступные бренды в категории (фильтруем по продуктам)
  const availableBrandsInCategory = useMemo(() => {
    const brandNames = new Set<string>();
    products.forEach(product => {
      if (product.brand && product.brand.trim()) {
        brandNames.add(product.brand);
      }
    });
    return Array.from(brandNames);
  }, [products]);

  const availableBrands = useMemo(() => {
    return brands.filter(brand => availableBrandsInCategory.includes(brand.name));
  }, [brands, availableBrandsInCategory]);

  // Вычисляем диапазон цен из текущих продуктов
  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 200000 };

    const prices = products.map(p => p.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
  }, [products]);

  // Функции для localStorage
  const saveFiltersToStorage = (filters: {
    selectedBrands: string[];
    priceRange: [number, number];
    sortBy: string;
    categorySlug: string;
  }) => {
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.warn('Не удалось сохранить фильтры:', error);
    }
  };

  const loadFiltersFromStorage = (currentCategorySlug: string) => {
    try {
      const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (saved) {
        const filters = JSON.parse(saved);
        if (filters.categorySlug === currentCategorySlug) {
          return filters;
        }
      }
    } catch (error) {
      console.warn('Не удалось загрузить фильтры:', error);
    }
    return null;
  };

  const clearFiltersFromStorage = () => {
    try {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch (error) {
      console.warn('Не удалось очистить фильтры:', error);
    }
  };

  // Загрузка сохраненных фильтров при изменении категории
  useEffect(() => {
    if (categorySlug) {
      const savedFilters = loadFiltersFromStorage(categorySlug);
      if (savedFilters) {
        setSelectedBrands(savedFilters.selectedBrands || []);
        setPriceRange(savedFilters.priceRange || [0, 200000]);
        setTempPriceRange(savedFilters.priceRange || [0, 200000]);
        setSortBy(savedFilters.sortBy || 'featured');
      } else {
        // Сбрасываем фильтры для новой категории
        setSelectedBrands([]);
        setSortBy('featured');
        setPriceRange([0, 200000]);
        setTempPriceRange([0, 200000]);
      }
    }
  }, [categorySlug]);

  // Обновляем диапазон цен при загрузке данных
  useEffect(() => {
    if (products.length > 0 && priceRange[0] === 0 && priceRange[1] === 200000) {
      const newRange: [number, number] = [minPrice, maxPrice];
      setPriceRange(newRange);
      setTempPriceRange(newRange);
    }
  }, [products, minPrice, maxPrice, priceRange]);

  // Обработчики
  const handleBrandToggle = (brand: string) => {
    const newSelectedBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];

    setSelectedBrands(newSelectedBrands);

    saveFiltersToStorage({
      selectedBrands: newSelectedBrands,
      priceRange,
      sortBy,
      categorySlug
    });
  };

  const handlePriceChange = (value: [number, number]) => {
    setTempPriceRange(value);
  };

  const applyPriceFilterNow = () => {
    setPriceRange(tempPriceRange);
    saveFiltersToStorage({
      selectedBrands,
      priceRange: tempPriceRange,
      sortBy,
      categorySlug
    });
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    saveFiltersToStorage({
      selectedBrands,
      priceRange,
      sortBy: newSortBy,
      categorySlug
    });
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    const resetRange: [number, number] = [minPrice, maxPrice];
    setPriceRange(resetRange);
    setTempPriceRange(resetRange);
    setSortBy('featured');
    clearFiltersFromStorage();
  };

  const handleSubCategoryClick = (subCatSlug: string) => {
    navigate(`/category/${categorySlug}/${subCatSlug}`);
  };

  const handleBackToCategory = () => {
    navigate(`/category/${categorySlug}`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Состояние загрузки
  const isLoading = categoriesLoading || brandsLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div className="text-lg">Загрузка товаров...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-2">⚠️ Произошла ошибка</div>
            <div className="text-gray-700">{(productsError as Error).message}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <span>/</span>
            <Link to={`/category/${categorySlug}`} className="hover:text-blue-600">
              {currentCategory?.category || decodeURIComponent(categorySlug)}
            </Link>
            {subCategorySlug && (
              <>
                <span>/</span>
                <span className="text-gray-900">{subCategorySlug}</span>
              </>
            )}
          </div>
        </nav>

        <div className="mb-6">
          <div className="relative mb-4 h-40 overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-opacity-90 flex items-center justify-center" style={{ background: "rgb(227 6 19 / var(--tw-bg-opacity, 1))" }}>
              <h1 className="text-3xl font-bold text-white text-center px-4">
                {subCategorySlug ? subCategorySlug : (currentCategory?.category || decodeURIComponent(categorySlug))}
              </h1>
            </div>
          </div>

          {/* Подкатегории */}
          {!subCategorySlug && subCategories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Подкатегории</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {subCategories.map((subCat) => (
                  <button
                    key={subCat.slug}
                    onClick={() => handleSubCategoryClick(subCat.name)}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-1">{subCat.name}</div>
                    <div className="text-xs text-gray-500">{subCat.count} товаров</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка возврата к категории */}
          {subCategorySlug && (
            <div className="mb-4">
              <button
                onClick={handleBackToCategory}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Назад к {currentCategory?.category}
              </button>
            </div>
          )}

          <p className="text-gray-600">
            Показано товаров: {products.length} из {totalCount}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Фильтры */}
          <div className={`lg:w-1/4 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow divide-y">
              <div className="p-4">
                <h3 className="font-medium mb-4">Цена</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    value={tempPriceRange}
                    onValueChange={handlePriceChange}
                    min={minPrice}
                    max={maxPrice}
                    step={1000}
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
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input-field text-sm py-2"
                >
                  <option value="featured">По умолчанию</option>
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
                {hasNextPage && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isFetchingNextPage}
                      className="primary-button inline-flex items-center gap-2 min-w-[200px] justify-center"
                    >
                      {isFetchingNextPage ? (
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

                {!hasNextPage && products.length > 0 && (
                  <div className="mt-8 text-center text-gray-500">
                    Больше товаров нет
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
};

export default Category;