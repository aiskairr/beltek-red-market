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

  // Note: Category and price filtering are done client-side because:
  // - MoySklad pathName filter is complex
  // - MoySklad doesn't support filtering on nested array fields like salePrices.value
  // We fetch all products and filter in memory

  if (filters.inStock !== undefined) {
    filterParts.push(`archived=${!filters.inStock}`);
  }

  return filterParts.join(';');
};

// Fetch products with pagination and filters
const fetchProductsQuery = async (
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters: ProductFilters = {}
): Promise<ProductsPage> => {
  const offset = (page - 1) * pageSize;
  
  // Если есть фильтр по подкатегории - загружаем ВСЕ товары
  const actualLimit = filters.mini_category ? 1000 : pageSize;
  
  const params: any = {
    limit: actualLimit, // ← Изменено
    offset: filters.mini_category ? 0 : offset, // ← Изменено
    order: 'updated,desc',
  };

  // Add search term
  if (filters.searchTerm) {
    params.search = filters.searchTerm;
  }

  // Add filters
  const filterString = buildFilterString(filters);
  if (filterString) {
    params.filter = filterString;
  }

  const response = await moySkladAPI.getProducts(params);
  
  // Transform products (без загрузки изображений - это вызывает таймауты)
  const products = response.rows.map((msProduct) => {
    const product = transformMoySkladProduct(msProduct);
    
    // Используем placeholder для изображений
    product.images = [];
    product.image = 'https://via.placeholder.com/400x400?text=No+Image';
    
    return product;
  });

  // Client-side filtering
  let filteredProducts = products;
  
  // Filter by category if specified
  if (filters.category) {
    filteredProducts = filteredProducts.filter(p => {
      if (!p.pathName && !p.category) return false;
      
      const productPath = (p.pathName || p.category || '').toLowerCase();
      const filterCategory = filters.category!.toLowerCase();
      
      // Убираем номер категории для сравнения
      const cleanProductPath = productPath.replace(/^\d+\.\s*/, '');
      const cleanFilterCategory = filterCategory.replace(/^\d+\.\s*/, '');
      
      return cleanProductPath === cleanFilterCategory || 
             cleanProductPath.startsWith(cleanFilterCategory + '/');
    });
  }
  
  // Filter by mini_category if specified (this is more specific)
  if (filters.mini_category) {
    console.log('🔍 Filtering by mini_category:', filters.mini_category);
    console.log('Products before filter:', filteredProducts.length);
    
    filteredProducts = filteredProducts.filter(p => {
      if (p.mini_category) {
        const matches = p.mini_category.toLowerCase() === filters.mini_category!.toLowerCase();
        if (matches) console.log('✅ Match by mini_category:', p.name);
        return matches;
      }
      
      if (p.pathName) {
        const pathParts = p.pathName.split('/');
        const lastPart = pathParts[pathParts.length - 1].trim();
        const matches = lastPart.toLowerCase() === filters.mini_category!.toLowerCase();
        if (matches) console.log('✅ Match by pathName:', p.name, '|', lastPart);
        return matches;
      }
      
      return false;
    });
    
    console.log('Products after filter:', filteredProducts.length);
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

  // Для подкатегорий используем количество отфильтрованных товаров
  const totalCount = filters.mini_category ? filteredProducts.length : response.meta.size;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;

  return {
    products: filteredProducts,
    totalCount,
    totalPages,
    hasMore,
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
  const { toast } = useToast();

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.infiniteProducts(filters, pageSize),
    queryFn: ({ pageParam = 1 }) => fetchProductsQuery(pageParam as number, pageSize, filters),
    getNextPageParam: (lastPage: ProductsPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
      
      return product;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
