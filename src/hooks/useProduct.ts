// hooks/useProducts.ts
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Template {
  name: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  mini_category?: string;
  description: string;
  price: number;
  brand: string;
  image?: string; // Главное изображение (для обратной совместимости)
  images?: string[]; // Массив всех изображений
  templates?: Template[]; // Заменили characteristics на templates
  in_stock?: boolean;
  created_at: string;
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

const DEFAULT_PAGE_SIZE = 50;

// Ключи для кеширования
const QUERY_KEYS = {
  products: (filters?: ProductFilters, pageSize?: number) => [
    'products', 
    { filters, pageSize }
  ],
  infiniteProducts: (filters?: ProductFilters, pageSize?: number) => [
    'products', 
    'infinite',
    { filters, pageSize }
  ],
  product: (id: number) => ['products', id],
  productsByCategory: (category: string) => ['products', 'category', category],
  productsByBrand: (brand: string) => ['products', 'brand', brand],
} as const;

// Утилиты для работы с изображениями
const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const deleteProductImages = async (imageUrls: string[]) => {
  const deletePromises = imageUrls.map(async (imageUrl: string) => {
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `products/${fileName}`;
      
      await supabase.storage
        .from('products')
        .remove([filePath]);
    } catch (error) {
      console.warn('Не удалось удалить изображение:', imageUrl, error);
    }
  });
  
  await Promise.all(deletePromises);
};

// Базовая функция для выполнения запросов к продуктам
const fetchProductsQuery = async (
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters: ProductFilters = {}
): Promise<ProductsPage> => {
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  // Добавляем фильтры
  if (filters.searchTerm) {
    query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,brand.ilike.%${filters.searchTerm}%`);
  }
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  if (filters.brand) {
    query = query.eq('brand', filters.brand);
  }
  
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }
  
  if (filters.inStock !== undefined) {
    query = query.eq('in_stock', filters.inStock);
  }

  // Пагинация
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  
  if (error) throw error;
  
  // Обрабатываем templates и images
  const parsedProducts = (data || []).map(product => ({
    ...product,
    templates: product.templates || [],
    images: product.images || [],
    image: product.image || (product.images && product.images.length > 0 ? product.images[0] : '')
  }));

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = page < totalPages;

  return {
    products: parsedProducts,
    totalCount,
    totalPages,
    hasMore,
    page
  };
};

// Хук для получения продуктов с пагинацией (обычная пагинация)
export const useProducts = (
  filters: ProductFilters = {},
  pageSize: number = DEFAULT_PAGE_SIZE,
  page: number = 1
) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.products(filters, pageSize), page],
    queryFn: () => fetchProductsQuery(page, pageSize, filters),
    staleTime: 2 * 60 * 1000, // 2 минуты для продуктов
    gcTime: 5 * 60 * 1000, // 5 минут
  });

  // Обработка ошибок
  if (query.error) {
    toast({
      title: "Ошибка загрузки",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};

// Хук для infinite scroll продуктов
export const useInfiniteProducts = (
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

  // Обработка ошибок
  if (query.error) {
    toast({
      title: "Ошибка загрузки",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};

// Хук для получения конкретного продукта
export const useProduct = (id: number) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: QUERY_KEYS.product(id),
    queryFn: async (): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        ...data,
        templates: data.templates || [],
        images: data.images || [],
        image: data.image || (data.images && data.images.length > 0 ? data.images[0] : '')
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Обработка ошибок
  if (query.error) {
    toast({
      title: "Ошибка загрузки продукта",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};

// Хук для получения продуктов по категории
export const useProductsByCategory = (category: string) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: QUERY_KEYS.productsByCategory(category),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return (data || []).map(product => ({
        ...product,
        templates: product.templates || [],
        images: product.images || [],
        image: product.image || (product.images && product.images.length > 0 ? product.images[0] : '')
      }));
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Обработка ошибок
  if (query.error) {
    toast({
      title: "Ошибка загрузки продуктов",
      description: (query.error as Error).message,
      variant: "destructive",
    });
  }

  return query;
};

// Хук для добавления продукта
export const useAddProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: Partial<Product> & { 
      name: string; 
      category: string; 
      price: number; 
      description: string; 
    }): Promise<Product> => {
      const insertData = {
        name: productData.name,
        category: productData.category,
        mini_category: productData.mini_category || null,
        brand: productData.brand || '',
        description: productData.description,
        price: productData.price,
        image: productData.image || "",
        images: productData.images || [],
        templates: productData.templates || [],
        in_stock: productData.in_stock !== undefined ? productData.in_stock : true
      };

      const { data, error } = await supabase
        .from("products")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Инвалидируем все связанные кеши продуктов
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Добавляем новый продукт в кеш
      queryClient.setQueryData(QUERY_KEYS.product(data.id), data);

      toast({
        title: "Товар добавлен",
        description: `${data.name} успешно добавлен`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Хук для обновления продукта
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { 
      id: number; 
      formData: any 
    }): Promise<Product> => {
      let imageUrls: string[] = [];
      let mainImageUrl = "";

      if (formData.images && Array.isArray(formData.images)) {
        imageUrls = formData.images;
        mainImageUrl = imageUrls[0] || "";
      } else if (formData.image) {
        if (formData.image instanceof File) {
          mainImageUrl = await uploadProductImage(formData.image);
          imageUrls = [mainImageUrl];
        } else {
          mainImageUrl = formData.image;
          imageUrls = [mainImageUrl];
        }
      }

      const updateData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        image: mainImageUrl,
        images: imageUrls,
        brand: formData.brand,
        category: formData.category,
        mini_category: formData.mini_category || null,
        templates: formData.templates || [],
        in_stock: formData.in_stock
      };

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, { id }) => {
      // Обновляем кеш конкретного продукта
      queryClient.setQueryData(QUERY_KEYS.product(id), data);
      
      // Инвалидируем связанные кеши
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: "Товар обновлён",
        description: `Товар "${data.name}" успешно обновлён`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка обновления товара",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Хук для удаления продукта
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<{ id: number; name: string }> => {
      // Получаем данные продукта для удаления изображений
      const { data: productToDelete } = await supabase
        .from("products")
        .select("name, images, image")
        .eq("id", id)
        .single();

      // Удаляем продукт
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Удаляем изображения из storage
      if (productToDelete?.images && Array.isArray(productToDelete.images)) {
        await deleteProductImages(productToDelete.images);
      }

      return { 
        id, 
        name: productToDelete?.name || `Товар #${id}` 
      };
    },
    onSuccess: ({ id, name }) => {
      // Удаляем из кеша конкретного продукта
      queryClient.removeQueries({ queryKey: QUERY_KEYS.product(id) });
      
      // Инвалидируем все связанные кеши продуктов
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: "Товар удалён",
        description: `Товар "${name}" был удалён.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар.",
        variant: "destructive",
      });
    },
  });
};

// Хук для массового удаления продуктов
export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids: number[]): Promise<number> => {
      // Получаем данные продуктов для удаления изображений
      const { data: productsToDelete } = await supabase
        .from("products")
        .select("id, name, images, image")
        .in("id", ids);

      // Удаляем продукты
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", ids);

      if (error) throw error;

      // Удаляем изображения из storage
      if (productsToDelete) {
        const allImages = productsToDelete.flatMap(product => 
          product.images && Array.isArray(product.images) ? product.images : []
        );
        if (allImages.length > 0) {
          await deleteProductImages(allImages);
        }
      }

      return ids.length;
    },
    onSuccess: (deletedCount, ids) => {
      // Удаляем из кешей конкретных продуктов
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.product(id) });
      });
      
      // Инвалидируем все связанные кеши продуктов
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: "Товары удалены",
        description: `Удалено товаров: ${deletedCount}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка массового удаления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Утилиты для работы с кешем продуктов
export const useProductUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Получить продукт по ID из кеша
    getProductById: (id: number): Product | undefined => {
      return queryClient.getQueryData<Product>(QUERY_KEYS.product(id));
    },

    // Получить продукты по категории из кеша
    getProductsByCategory: (category: string): Product[] | undefined => {
      return queryClient.getQueryData<Product[]>(QUERY_KEYS.productsByCategory(category));
    },

    // Предзагрузить продукт
    prefetchProduct: (id: number) => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.product(id),
        queryFn: async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          return data;
        },
      });
    },

    // Предзагрузить продукты категории
    prefetchProductsByCategory: (category: string) => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.productsByCategory(category),
        queryFn: async () => {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          return data || [];
        },
      });
    },

    // Инвалидировать кеш продуктов
    invalidateProducts: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },

    // Очистить кеш продуктов
    clearProductsCache: () => {
      queryClient.removeQueries({ queryKey: ['products'] });
    },

    // Получить все уникальные бренды из кеша
    getAllBrands: (): string[] => {
      const allQueries = queryClient.getQueriesData<ProductsPage | Product[]>({ queryKey: ['products'] });
      const brands = new Set<string>();
      
      allQueries.forEach(([, data]) => {
        if (data) {
          const products = Array.isArray(data) ? data : 'products' in data ? data.products : [];
          products.forEach(product => {
            if (product.brand && product.brand.trim()) {
              brands.add(product.brand.trim());
            }
          });
        }
      });
      
      return Array.from(brands).sort();
    },

    // Получить все уникальные категории из кеша
    getAllCategories: (): string[] => {
      const allQueries = queryClient.getQueriesData<ProductsPage | Product[]>({ queryKey: ['products'] });
      const categories = new Set<string>();
      
      allQueries.forEach(([, data]) => {
        if (data) {
          const products = Array.isArray(data) ? data : 'products' in data ? data.products : [];
          products.forEach(product => {
            if (product.category && product.category.trim()) {
              categories.add(product.category.trim());
            }
          });
        }
      });
      
      return Array.from(categories).sort();
    },
  };
};

// Комбинированный хук для удобства (аналог оригинального useProducts)
export const useProductsWithMutations = (
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters: ProductFilters = {},
  page: number = 1
) => {
  const productsQuery = useProducts(filters, pageSize, page);
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();
  const utils = useProductUtils();
  const queryClient = useQueryClient();

  // Методы для управления пагинацией
  const goToPage = async (newPage: number, searchTerm: string, selectedCategory: string, newFilters?: ProductFilters) => {
    const filtersToUse = newFilters || filters;
    // Инвалидируем текущий запрос и делаем новый
    await queryClient.invalidateQueries({ 
      queryKey: [...QUERY_KEYS.products(filtersToUse, pageSize), newPage] 
    });
  };

  const searchProducts = async (searchTerm: string, category?: string) => {
    const newFilters = { ...filters, searchTerm, category };
    await queryClient.invalidateQueries({ 
      queryKey: [...QUERY_KEYS.products(newFilters, pageSize), 1] 
    });
  };

  const changePageSize = async (newPageSize: number, searchTerm: string, selectedCategory: string, newFilters?: ProductFilters) => {
    const filtersToUse = newFilters || filters;
    await queryClient.invalidateQueries({ 
      queryKey: [...QUERY_KEYS.products(filtersToUse, newPageSize), 1] 
    });
  };

  // Для infinite scroll можно использовать отдельный хук
  const infiniteQuery = useInfiniteProducts(filters, pageSize);
  
  const loadMore = async (searchTerm: string, selectedCategory: string) => {
    if (infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
      await infiniteQuery.fetchNextPage();
    }
  };

  return {
    // Данные и состояние
    products: productsQuery.data?.products || [],
    loading: productsQuery.isLoading,
    error: productsQuery.error,
    totalCount: productsQuery.data?.totalCount || 0,
    totalPages: productsQuery.data?.totalPages || 0,
    hasMore: productsQuery.data?.hasMore || false,
    currentPage: page,
    pageSize,
    
    // Мутации
    addProduct: addProductMutation.mutateAsync,
    onEdit: (id: number, formData: any) => 
      updateProductMutation.mutateAsync({ id, formData }),
    deleteProduct: deleteProductMutation.mutateAsync,
    bulkDeleteProducts: bulkDeleteMutation.mutateAsync,
    
    // Состояние мутаций
    isAdding: addProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    
    // Методы пагинации
    goToPage,
    searchProducts,
    changePageSize,
    loadMore,
    
    // Утилиты
    getProductById: utils.getProductById,
    prefetchProduct: utils.prefetchProduct,
    getAllBrands: utils.getAllBrands,
    getAllCategories: utils.getAllCategories,
    
    // Рефетч
    refetch: productsQuery.refetch,
  };
};