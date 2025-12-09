// hooks/useMoySkladProducts.ts
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { 
  moySkladAPI, 
  transformMoySkladProduct,
  MoySkladProduct 
} from '@/lib/moysklad';

export interface Product {
  id: string;
  name: string;
  category: string;
  mini_category?: string;
  pathName?: string;
  description: string;
  price: number;
  brand: string;
  image?: string;
  images?: string[];
  templates?: Array<{ name: string; value: string }>;
  in_stock?: boolean;
  created_at: string;
  code?: string;
  externalCode?: string;
  barcode?: string;
}

export interface ProductFilters {
  mini_category?: string;
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductsPage {
  products: Product[];
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
  page: number;
}

const DEFAULT_PAGE_SIZE = 100; // Increased to get more products for client-side filtering

// Query keys
const QUERY_KEYS = {
  products: (filters?: ProductFilters, pageSize?: number) => [
    'moysklad-products', 
    { filters, pageSize }
  ],
  infiniteProducts: (filters?: ProductFilters, pageSize?: number) => [
    'moysklad-products', 
    'infinite',
    { filters, pageSize }
  ],
  product: (id: string) => ['moysklad-products', id],
  productImages: (id: string) => ['moysklad-products', id, 'images'],
} as const;

// Fetch product images
const fetchProductImages = async (productId: string): Promise<string[]> => {
  try {
    const response = await moySkladAPI.getProductImages(productId);
    return response.rows.map(img => img.miniature.downloadHref);
  } catch (error) {
    console.warn('Failed to fetch product images:', error);
    return [];
  }
};

// Build filter string for MoySklad API
const buildFilterString = (filters: ProductFilters): string => {
  const filterParts: string[] = [];

  // НЕ фильтруем на API - загружаем ВСЕ товары
  // Фильтрация будет на клиенте (быстрее с кешем)
  
  if (filters.inStock !== undefined) {
    filterParts.push(`archived=${!filters.inStock}`);
  }

  return filterParts.join(';');
};

// Cache key для localStorage
const CACHE_VERSION = 'v3'; // Изменяйте при изменении формата кеша
const CACHE_KEY = `moysklad_products_cache_${CACHE_VERSION}`;
const CACHE_TIMESTAMP_KEY = `moysklad_products_cache_timestamp_${CACHE_VERSION}`;
const CACHE_DURATION = 60 * 60 * 1000; // 1 час

// Загрузить из localStorage
const loadFromCache = (): any[] | null => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();
    
    // Проверяем не истек ли кеш
    if (timestamp && (now - parseInt(timestamp)) < CACHE_DURATION) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const products = JSON.parse(cached);
        console.log(`✅ Loaded ${products.length} products from localStorage cache`);
        return products;
      }
    }
  } catch (error) {
    console.warn('Failed to load from cache:', error);
  }
  return null;
};

// Сохранить в localStorage
const saveToCache = (products: any[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log(`💾 Saved ${products.length} products to localStorage cache`);
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

// Флаг для отслеживания фоновой загрузки
let backgroundLoadingInProgress = false;

// Функция для фоновой загрузки остальных товаров
const loadRemainingProductsInBackground = async (
  filters: ProductFilters = {}
) => {
  if (backgroundLoadingInProgress) {
    console.log('⏭️ Background loading already in progress, skipping...');
    return;
  }

  backgroundLoadingInProgress = true;
  console.log('🔄 Starting background loading of remaining products...');

  try {
    const MAX_LIMIT = 1000;
    let allRows: any[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore && allRows.length < 5000) {
      const params: any = {
        limit: MAX_LIMIT,
        offset: offset,
        order: 'updated,desc',
      };

      if (filters.searchTerm) {
        params.search = filters.searchTerm;
      }

      const filterString = buildFilterString(filters);
      if (filterString) {
        params.filter = filterString;
      }

      const response = await moySkladAPI.getProducts(params);

      if (!response || !response.rows) {
        console.error('❌ Invalid API response:', response);
        break;
      }

      allRows = allRows.concat(response.rows);

      console.log(`📦 Background: Loaded ${allRows.length} / ${response.meta.size} products`);

      hasMore = response.rows.length === MAX_LIMIT && allRows.length < response.meta.size;
      offset += MAX_LIMIT;
    }

    console.log(`✅ Background: Total loaded ${allRows.length} products`);

    // Transform products
    const products = allRows.map((msProduct) => {
      const product = transformMoySkladProduct(msProduct);
      product.images = [];
      product.image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
      return product;
    });

    // Сохраняем полный набор в кеш
    saveToCache(products);
    console.log('💾 Background: Saved all products to cache');

  } catch (error) {
    console.error('❌ Background loading error:', error);
  } finally {
    backgroundLoadingInProgress = false;
  }
};

// Fetch products with pagination and filters
const fetchProductsQuery = async (
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters: ProductFilters = {}
): Promise<ProductsPage> => {
  // Сначала пробуем загрузить из кеша (уже трансформированные продукты!)
  const cachedProducts = loadFromCache();
  let products: any[];

  if (cachedProducts) {
    // Используем готовые продукты из кеша - МГНОВЕННО!
    products = cachedProducts;
    console.log(`✅ Using ${products.length} products from cache`);
  } else {
    // Кеша нет - загружаем ТОЛЬКО ПЕРВУЮ 1000 для быстрого отображения
    const MAX_LIMIT = 1000;

    console.log('🚀 Fast loading: Loading first 1000 products...');

    try {
      const params: any = {
        limit: MAX_LIMIT,
        offset: 0,
        order: 'updated,desc',
      };

      if (filters.searchTerm) {
        params.search = filters.searchTerm;
      }

      const filterString = buildFilterString(filters);
      if (filterString) {
        params.filter = filterString;
      }

      const response = await moySkladAPI.getProducts(params);

      if (!response || !response.rows) {
        console.error('❌ Invalid API response:', response);
        throw new Error('Получен некорректный ответ от API');
      }

      console.log(`📦 Fast load: Got ${response.rows.length} products (${response.meta.size} total available)`);

      // Transform первую партию
      products = response.rows.map((msProduct) => {
        const product = transformMoySkladProduct(msProduct);
        product.images = [];
        product.image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
        return product;
      });

      console.log(`✅ Fast load: Transformed ${products.length} products, showing immediately!`);

      // Если есть еще товары - запускаем фоновую загрузку
      if (response.meta.size > MAX_LIMIT) {
        console.log(`🔄 Starting background load for remaining ${response.meta.size - MAX_LIMIT} products...`);
        // Запускаем фоновую загрузку без await (не блокируем!)
        loadRemainingProductsInBackground(filters).catch(err => {
          console.error('Background loading failed:', err);
        });
      } else {
        // Если товаров меньше 1000 - сразу сохраняем в кеш
        saveToCache(products);
      }

    } catch (error) {
      console.error('❌ Error loading products from API:', error);

      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Не удалось подключиться к API. Проверьте соединение с прокси-сервером.');
      }

      throw error;
    }
  }

  // Клиентская фильтрация (все товары загружены, фильтруем в памяти)
  let filteredProducts = products;
  
  // Filter by category if specified
  if (filters.category) {
    filteredProducts = filteredProducts.filter(p => {
      if (!p.pathName && !p.category) return false;
      
      // Get the first part of pathName (main category) and clean it
      const pathParts = (p.pathName || '').split('/');
      const productCategory = (pathParts[0] || p.category || '').trim();
      
      // Clean both from number prefixes like "1. ", "2. " etc
      const cleanProductCategory = productCategory.replace(/^\d+\.\s*/, '').toLowerCase();
      const cleanFilterCategory = filters.category!.replace(/^\d+\.\s*/, '').toLowerCase();
      
      return cleanProductCategory === cleanFilterCategory;
    });
  }
  
  // Filter by mini_category if specified
  if (filters.mini_category) {
    filteredProducts = filteredProducts.filter(p => {
      if (!p.pathName) return false;
      const pathParts = p.pathName.split('/');
      if (pathParts.length < 2) return false;
      
      // Clean both from number prefixes
      const productSubCategory = pathParts[pathParts.length - 1].trim().replace(/^\d+\.\s*/, '').toLowerCase();
      const filterSubCategory = filters.mini_category!.replace(/^\d+\.\s*/, '').toLowerCase();
      
      return productSubCategory === filterSubCategory;
    });
  }

  // Filter by brand if specified
  if (filters.brand) {
    filteredProducts = filteredProducts.filter(p => 
      p.brand?.toLowerCase() === filters.brand?.toLowerCase()
    );
  }

  // Filter by price range if specified
  if (filters.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
  }

  // Используем количество отфильтрованных товаров
  const totalCount = filteredProducts.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMorePages = page < totalPages;

  return {
    products: filteredProducts,
    totalCount,
    totalPages,
    hasMore: hasMorePages,
    page
  };
};

// Hook for paginated products
export const useMoySkladProducts = (
  filters: ProductFilters = {},
  pageSize: number = DEFAULT_PAGE_SIZE,
  page: number = 1
) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.products(filters, pageSize), page],
    queryFn: () => fetchProductsQuery(page, pageSize, filters),
    staleTime: 60 * 60 * 1000, // 1 час - совпадает с localStorage кешем
    gcTime: 2 * 60 * 60 * 1000, // 2 часа
  });

  if (query.error) {
    toast({
      title: "Ошибка загрузки товаров",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};

// Hook for infinite scroll
export const useInfiniteMoySkladProducts = (
  filters: ProductFilters = {},
  pageSize: number = DEFAULT_PAGE_SIZE
) => {
  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.infiniteProducts(filters, pageSize),
    queryFn: ({ pageParam = 1 }) => fetchProductsQuery(pageParam as number, pageSize, filters),
    getNextPageParam: (lastPage: ProductsPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 60 * 1000, // 1 час - совпадает с localStorage кешем
    gcTime: 2 * 60 * 60 * 1000, // 2 часа
  });

  // Логируем ошибку в консоль вместо toast (toast вызывает бесконечный рендер)
  if (query.error) {
    console.error('Ошибка загрузки товаров:', query.error);
  }

  return query;
};

// Hook for single product
export const useMoySkladProduct = (id: string) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: async (): Promise<Product> => {
      const msProduct = await moySkladAPI.getProduct(id);
      const product = transformMoySkladProduct(msProduct);

      // Fetch images
      const images = await fetchProductImages(id);
      product.images = images;
      product.image = images[0] || '';

      // If product has variants, load characteristics from ALL variants and combine them
      if (msProduct.variantsCount && msProduct.variantsCount > 0) {
        try {
          const variantsResponse = await moySkladAPI.getProductVariants(id);
          if (variantsResponse.rows && variantsResponse.rows.length > 0) {
            // Collect all unique characteristic names and their possible values
            const characteristicsMap = new Map<string, Set<string>>();

            variantsResponse.rows.forEach(variant => {
              if (variant.characteristics) {
                variant.characteristics.forEach(char => {
                  if (!characteristicsMap.has(char.name)) {
                    characteristicsMap.set(char.name, new Set());
                  }
                  characteristicsMap.get(char.name)!.add(char.value);
                });
              }
            });

            // Convert to templates format showing all possible values
            const variantChars = Array.from(characteristicsMap.entries()).map(([name, values]) => ({
              name: name,
              value: Array.from(values).join(', ')
            }));

            // Combine with existing templates
            product.templates = [...(product.templates || []), ...variantChars];
            console.log('✨ Added characteristics from variants:', variantChars);
          }
        } catch (error) {
          console.error('❌ Error loading variant characteristics:', error);
        }
      }

      return product;
    },
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 час
    gcTime: 2 * 60 * 60 * 1000, // 2 часа
  });

  if (query.error) {
    toast({
      title: "Ошибка загрузки товара",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};

// Hook for products by category
export const useMoySkladProductsByCategory = (category: string) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['moysklad-products', 'category', category],
    queryFn: async (): Promise<Product[]> => {
      const params = {
        filter: `pathName~=${encodeURIComponent(category)}`,
        limit: 1000,
      };

      const response = await moySkladAPI.getProducts(params);
      
      const products = await Promise.all(
        response.rows.map(async (msProduct) => {
          const product = transformMoySkladProduct(msProduct);
          const images = await fetchProductImages(msProduct.id);
          product.images = images;
          product.image = images[0] || '';
          return product;
        })
      );

      return products;
    },
    enabled: !!category,
    staleTime: 60 * 60 * 1000, // 1 час
    gcTime: 2 * 60 * 60 * 1000, // 2 часа
  });

  if (query.error) {
    toast({
      title: "Ошибка загрузки товаров категории",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};

// Utility hooks
export const useMoySkladProductUtils = () => {
  const queryClient = useQueryClient();

  return {
    getProductById: (id: string): Product | undefined => {
      return queryClient.getQueryData<Product>(QUERY_KEYS.product(id));
    },

    prefetchProduct: (id: string) => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.product(id),
        queryFn: async () => {
          const msProduct = await moySkladAPI.getProduct(id);
          const product = transformMoySkladProduct(msProduct);
          const images = await fetchProductImages(id);
          product.images = images;
          product.image = images[0] || '';
          return product;
        },
      });
    },

    invalidateProducts: () => {
      queryClient.invalidateQueries({ queryKey: ['moysklad-products'] });
    },

    clearProductsCache: () => {
      queryClient.removeQueries({ queryKey: ['moysklad-products'] });
    },
  };
};

// Combined hook for convenience
export const useMoySkladProductsWithMutations = (
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters: ProductFilters = {},
  page: number = 1
) => {
  const productsQuery = useMoySkladProducts(filters, pageSize, page);
  const utils = useMoySkladProductUtils();
  const queryClient = useQueryClient();

  const goToPage = async (newPage: number) => {
    await queryClient.invalidateQueries({ 
      queryKey: [...QUERY_KEYS.products(filters, pageSize), newPage] 
    });
  };

  const searchProducts = async (searchTerm: string, category?: string) => {
    const newFilters = { ...filters, searchTerm, category };
    await queryClient.invalidateQueries({ 
      queryKey: [...QUERY_KEYS.products(newFilters, pageSize), 1] 
    });
  };

  return {
    products: productsQuery.data?.products || [],
    loading: productsQuery.isLoading,
    error: productsQuery.error,
    totalCount: productsQuery.data?.totalCount || 0,
    totalPages: productsQuery.data?.totalPages || 0,
    hasMore: productsQuery.data?.hasMore || false,
    currentPage: page,
    pageSize,
    
    goToPage,
    searchProducts,

    getProductById: utils.getProductById,
    prefetchProduct: utils.prefetchProduct,

    refetch: productsQuery.refetch,
  };
};

// Hook for getting product variants (modifications)
export const useMoySkladProductVariants = (productId: string) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['moysklad-variants', productId],
    queryFn: async () => {
      if (!productId) return [];

      console.log('🔍 Fetching variants for product:', productId);

      const variantsResponse = await moySkladAPI.getProductVariants(productId);

      console.log('✅ Variants response:', variantsResponse);

      // Transform variants to our format
      const variants = await Promise.all(
        variantsResponse.rows.map(async (msVariant) => {
          // Get variant images
          let images: string[] = [];
          try {
            const imagesResponse = await moySkladAPI.getVariantImages(msVariant.id);
            images = imagesResponse.rows.map(img => img.meta.downloadHref);
          } catch (error) {
            console.warn('Could not fetch variant images:', error);
          }

          return {
            id: msVariant.id,
            name: msVariant.name,
            price: (msVariant.salePrices?.[0]?.value || 0) / 100,
            characteristics: msVariant.characteristics || [],
            images,
            stock: msVariant.stock || 0,
            inStock: (msVariant.stock || 0) > 0,
          };
        })
      );

      console.log('✅ Transformed variants:', variants);

      return variants;
    },
    enabled: !!productId,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });

  if (query.error) {
    console.error('❌ Error fetching variants:', query.error);
    toast({
      title: "Ошибка загрузки модификаций",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};
