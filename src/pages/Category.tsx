import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/hooks/use-cart';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';

const PRODUCTS_PER_PAGE = 9;

// Типы для категорий и брендов
interface Category {
  id?: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
}

interface SubCategory {
  name: string;
  slug: string;
  count: number;
}

const Category = () => {
  const { categorySlug = 'all', subCategorySlug } = useParams<{ categorySlug: string, subCategorySlug: string }>();
  const navigate = useNavigate();
  
  // Добавляем недостающие состояния
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Состояние для доступных брендов в категории
  const [availableBrandsInCategory, setAvailableBrandsInCategory] = useState<string[]>([]);
  
  // Разделяем состояния для цены
  const [tempPriceRange, setTempPriceRange] = useState<[number, number]>([0, 200000]); // Временное значение для слайдера
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]); // Применяемое значение для фильтрации
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  
  const [sortBy, setSortBy] = useState<string>('featured');
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
    }, 800); // Задержка 800мс после последнего изменения

    return () => clearTimeout(timeoutId);
  }, [tempPriceRange]);

  // Применяем фильтр по цене с задержкой
  useEffect(() => {
    const cleanup = applyPriceFilter();
    return cleanup;
  }, [applyPriceFilter]);

  // Загрузка динамических категорий
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
      
      // Найти текущую категорию
      if (categorySlug !== 'all') {
        const decodedSlug = decodeURIComponent(categorySlug);
        const category = data?.find(cat => 
          cat.slug === categorySlug || 
          cat.slug === decodedSlug || 
          cat.name === decodedSlug ||
          cat.id === categorySlug
        );
        setCurrentCategory(category || null);
        console.log('Найдена категория:', category);
      } else {
        setCurrentCategory({ name: 'Все товары', slug: 'all' });
      }
      
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      if (categorySlug !== 'all') {
        setCurrentCategory({ 
          name: decodeURIComponent(categorySlug), 
          slug: categorySlug 
        });
      } else {
        setCurrentCategory({ name: 'Все товары', slug: 'all' });
      }
    }
  };

 // Загрузка подкатегорий для текущей категории
const fetchSubCategories = async () => {
  if (categorySlug === 'all') {
    setSubCategories([]);
    return;
  }

  try {
    // Сначала пытаемся загрузить подкатегории из таблицы subcategories (если есть)
    let subcategoriesFromTable = [];
    
    try {
      const { data: subcatData, error: subcatError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_slug', categorySlug)
        .order('name');
      
      if (!subcatError && subcatData) {
        subcategoriesFromTable = subcatData.map(subcat => ({
          name: subcat.name,
          slug: subcat.slug,
          count: 0 // Инициализируем с 0, посчитаем позже
        }));
      }
    } catch (err) {
      console.log('Таблица subcategories не найдена или недоступна, используем товары');
    }

    // Теперь загружаем товары для подсчета количества в каждой подкатегории
    let productQuery = supabase
      .from('products')
      .select('mini_category');

    // Фильтрация по категории
    const decodedSlug = decodeURIComponent(categorySlug);
    if (currentCategory && currentCategory.name) {
      productQuery = productQuery.eq('category', currentCategory.name);
    } else {
      productQuery = productQuery.eq('category', decodedSlug);
    }

    const { data: productData, error: productError } = await productQuery;
    
    if (productError) throw productError;

    // Считаем количество товаров в каждой подкатегории
    const productCounts = {};
    if (productData && productData.length > 0) {
      productData.forEach(product => {
        if (product.mini_category) {
          productCounts[product.mini_category] = (productCounts[product.mini_category] || 0) + 1;
        }
      });
    }

    let finalSubCategories = [];

    if (subcategoriesFromTable.length > 0) {
      // Если есть подкатегории из таблицы, используем их и добавляем количество
      finalSubCategories = subcategoriesFromTable.map(subcat => ({
        ...subcat,
        count: productCounts[subcat.name] || 0
      }));

      // Добавляем подкатегории из товаров, которых нет в таблице subcategories
      Object.keys(productCounts).forEach(miniCategoryName => {
        const exists = subcategoriesFromTable.some(subcat => subcat.name === miniCategoryName);
        if (!exists) {
          finalSubCategories.push({
            name: miniCategoryName,
            slug: miniCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            count: productCounts[miniCategoryName]
          });
        }
      });
    } else {
      // Если нет таблицы subcategories, создаем подкатегории только из товаров
      finalSubCategories = Object.entries(productCounts).map(([name, count]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        count: count as number
      }));
    }

    // Сортируем по названию
    finalSubCategories.sort((a, b) => a.name.localeCompare(b.name));

    setSubCategories(finalSubCategories);

  } catch (err) {
    console.error('Ошибка загрузки подкатегорий:', err);
    setSubCategories([]);
  }
};

  // Получение доступных брендов для категории
  const fetchAvailableBrands = async () => {
    try {
      let brandQuery = supabase
        .from("products")
        .select("brand");

      // Фильтрация по категории
      if (categorySlug && categorySlug !== "all") {
        const decodedSlug = decodeURIComponent(categorySlug);
        
        if (currentCategory && currentCategory.name) {
          brandQuery = brandQuery.eq("category", currentCategory.name);
        } else {
          brandQuery = brandQuery.eq("category", decodedSlug);
        }
      }

      if (subCategorySlug) {
        brandQuery = brandQuery.eq("mini_category", subCategorySlug);
      }

      const { data: brandData, error: brandError } = await brandQuery;
      
      if (brandError) throw brandError;

      // Получаем уникальные бренды
      if (brandData && brandData.length > 0) {
        const uniqueBrands = Array.from(new Set(brandData.map(product => product.brand))).filter(Boolean);
        setAvailableBrandsInCategory(uniqueBrands);
      } else {
        setAvailableBrandsInCategory([]);
      }

    } catch (err: any) {
      console.error("Ошибка получения брендов для категории:", err.message);
      setAvailableBrandsInCategory([]);
    }
  };

  const fetchProductsInfo = async () => {
    try {
      // Сначала получаем все товары без фильтра по цене для определения диапазона
      let priceQuery = supabase
        .from("products")
        .select("price");

      // Фильтрация по категории для диапазона цен
      if (categorySlug && categorySlug !== "all") {
        const decodedSlug = decodeURIComponent(categorySlug);
        
        if (currentCategory && currentCategory.name) {
          priceQuery = priceQuery.eq("category", currentCategory.name);
        } else {
          priceQuery = priceQuery.eq("category", decodedSlug);
        }
      }

      if (subCategorySlug) {
        priceQuery = priceQuery.eq("mini_category", subCategorySlug);
      }

      // Применяем только фильтр по бренду для диапазона цен
      if (selectedBrands.length > 0) {
        priceQuery = priceQuery.in("brand", selectedBrands);
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
        
        // Устанавливаем начальные значения только при первой загрузке категории
        if (priceRange[0] === 0 && priceRange[1] === 200000) {
          setPriceRange([minPriceValue, maxPriceValue]);
          setTempPriceRange([minPriceValue, maxPriceValue]);
        }
      }

      // Теперь получаем количество с учетом всех фильтров включая цену
      let countQuery = supabase
        .from("products")
        .select("*", { count: 'exact', head: true });

      // Фильтрация по категории
      if (categorySlug && categorySlug !== "all") {
        const decodedSlug = decodeURIComponent(categorySlug);
        
        if (currentCategory && currentCategory.name) {
          countQuery = countQuery.eq("category", currentCategory.name);
        } else {
          countQuery = countQuery.eq("category", decodedSlug);
        }
      }

      if (subCategorySlug) {
        countQuery = countQuery.eq("mini_category", subCategorySlug);
      }

      // Применяем все фильтры для подсчета
      if (selectedBrands.length > 0) {
        countQuery = countQuery.in("brand", selectedBrands);
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

      // Фильтрация по категории
      if (categorySlug && categorySlug !== "all") {
        const decodedSlug = decodeURIComponent(categorySlug);
        
        if (currentCategory && currentCategory.name) {
          query = query.eq("category", currentCategory.name);
        } else {
          query = query.eq("category", decodedSlug);
        }
      }

      if (subCategorySlug) {
        query = query.eq("mini_category", subCategorySlug);
      }

      // Применяем фильтры
      if (selectedBrands.length > 0) {
        query = query.in("brand", selectedBrands);
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
        case 'featured':
        default:
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

  // Загрузка брендов
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');
        if (error) throw error;
        setBrands(data || []);
      } catch (err) {
        console.error('Ошибка загрузки брендов:', err);
      }
    };
    fetchBrands();
  }, []);

  // Загрузка категорий при монтировании
  useEffect(() => {
    fetchCategories();
  }, [categorySlug]);

  // Загрузка подкатегорий после загрузки категории
  useEffect(() => {
    if (currentCategory !== null) {
      fetchSubCategories();
    }
  }, [currentCategory, categorySlug]);

  // Загрузка товаров после загрузки категории
  useEffect(() => {
    if (currentCategory !== null || categorySlug === 'all') {
      // Сбрасываем фильтры при смене категории/подкатегории
      setProducts([]);
      setCurrentPage(0);
      setHasMore(true);
      
      // Загружаем доступные бренды для категории
      fetchAvailableBrands();
      
      // Сначала получаем информацию о товарах и диапазоне цен
      fetchProductsInfo().then(() => {
        // Затем загружаем товары
        fetchProducts(0, true);
      });
    }
  }, [currentCategory, subCategorySlug]);

  // Перезагрузка при изменении фильтров или сортировки
  useEffect(() => {
    if (currentCategory !== null || categorySlug === 'all') {
      setProducts([]);
      setCurrentPage(0);
      setHasMore(true);
      fetchProducts(0, true);
      // Обновляем информацию о товарах при изменении фильтров
      fetchProductsInfo();
    }
  }, [selectedBrands, priceRange, sortBy]);

  // Обновляем диапазон цен при изменении бренда
  useEffect(() => {
    if (currentCategory !== null || categorySlug === 'all') {
      fetchProductsInfo();
    }
  }, [selectedBrands]);

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(currentPage + 1);
    }
  };

  // Обработчик изменения слайдера - теперь изменяет только временное значение
  const handlePriceChange = (value: [number, number]) => {
    setTempPriceRange(value);
  };

  // Кнопка для мгновенного применения фильтра по цене
  const applyPriceFilterNow = () => {
    setPriceRange(tempPriceRange);
  };

  // Фильтруем бренды по тем, что доступны в текущей категории
  const availableBrands = brands.filter(brand => availableBrandsInCategory.includes(brand.name));

  const resetFilters = () => {
    setSelectedBrands([]);
    const resetRange: [number, number] = [minPrice, maxPrice];
    setPriceRange(resetRange);
    setTempPriceRange(resetRange);
    setSortBy('featured');
  };

  // Функция для перехода к подкатегории
  const handleSubCategoryClick = (subCatSlug: string) => {
    navigate(`/category/${categorySlug}/${subCatSlug}`);
  };

  // Функция для возврата к категории (убрать подкатегорию)
  const handleBackToCategory = () => {
    navigate(`/category/${categorySlug}`);
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
        {/* Хлебные крошки */}
        <nav className="mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <span>/</span>
            <Link to={`/category/${categorySlug}`} className="hover:text-blue-600">
              {currentCategory?.name || decodeURIComponent(categorySlug)}
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
                {subCategorySlug ? subCategorySlug : (currentCategory?.name || decodeURIComponent(categorySlug))}
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
                Назад к {currentCategory?.name}
              </button>
            </div>
          )}
          
          <p className="text-gray-600">
            Показано товаров: {products.length} из {totalCount}
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
    
    {/* Показываем диапазон доступных цен */}
    <div className="flex justify-between text-xs text-gray-500 mb-3">
      <span>Мин: {minPrice.toLocaleString()} с</span>
      <span>Макс: {maxPrice.toLocaleString()} с</span>
    </div>
    
    {/* Показываем кнопку применения только если есть изменения */}
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