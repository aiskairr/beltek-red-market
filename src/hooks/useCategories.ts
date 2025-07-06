// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: number;
  category: string;
  image?: string;
  mini_categories?: string[];
  templates?: string[];
  created_at?: string;
}

export interface CategoryFormData {
  category: string;
  image: File | null;
  mini_categories: string[];
  templates: string[];
}

export interface BulkImportResult {
  success: boolean;
  imported: number;
  categories: Category[];
}

// Ключи для кеширования
const QUERY_KEYS = {
  categories: ['categories'],
  category: (id: number) => ['categories', id],
  categoryByName: (name: string) => ['categories', 'name', name],
} as const;

// Утилиты для работы с изображениями
const uploadCategoryImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `categories/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('categories')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('categories')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const deleteCategoryImage = async (imageUrl: string) => {
  try {
    const imagePath = imageUrl.split('/').pop();
    if (imagePath) {
      await supabase.storage
        .from('categories')
        .remove([`categories/${imagePath}`]);
    }
  } catch (error) {
    console.warn('Не удалось удалить изображение из storage:', error);
  }
};

// Основной хук для получения всех категорий
export const useCategories = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, category, image, mini_categories, templates, created_at")
        .order("category", { ascending: true });

      if (error) {
        toast({
          title: "Ошибка загрузки категорий",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения конкретной категории
export const useCategory = (id: number) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.category(id),
    queryFn: async (): Promise<Category> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        toast({
          title: "Ошибка загрузки категории",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Хук для поиска категории по имени
export const useCategoryByName = (name: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.categoryByName(name),
    queryFn: async (): Promise<Category | null> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("category", name)
        .maybeSingle();
      
      if (error) {
        toast({
          title: "Ошибка поиска категории",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Хук для добавления категории
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: CategoryFormData): Promise<Category> => {
      let imageUrl = "";

      if (formData.image) {
        imageUrl = await uploadCategoryImage(formData.image);
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([{
          category: formData.category,
          image: imageUrl,
          mini_categories: formData.mini_categories.filter(cat => cat.trim()),
          templates: formData.templates.filter(template => template.trim())
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Обновляем кеш списка категорий
      queryClient.setQueryData<Category[]>(QUERY_KEYS.categories, (old) => {
        if (!old) return [data];
        return [...old, data].sort((a, b) => a.category.localeCompare(b.category));
      });

      // Добавляем новую категорию в кеш
      queryClient.setQueryData(QUERY_KEYS.category(data.id), data);
      queryClient.setQueryData(QUERY_KEYS.categoryByName(data.category), data);

      toast({
        title: "Категория добавлена",
        description: `Категория "${data.category}" успешно добавлена`,
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

// Хук для обновления категории
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { 
      id: number; 
      formData: Partial<CategoryFormData> & { 
        category: string;
        mini_categories?: string[];
        templates?: string[];
      }
    }): Promise<Category> => {
      let imageUrl = "";
      const image = formData.image;
      
      if (image instanceof File) {
        imageUrl = await uploadCategoryImage(image);
      } else if (typeof image === 'string') {
        imageUrl = image;
      }

      const { data, error } = await supabase
        .from("categories")
        .update({
          category: formData.category,
          image: imageUrl,
          mini_categories: formData.mini_categories || [],
          templates: formData.templates || []
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, { id }) => {
      // Получаем старые данные для сравнения
      const oldCategory = queryClient.getQueryData<Category>(QUERY_KEYS.category(id));
      
      // Обновляем кеш списка категорий
      queryClient.setQueryData<Category[]>(QUERY_KEYS.categories, (old) => {
        if (!old) return [data];
        return old.map(cat => cat.id === id ? data : cat)
          .sort((a, b) => a.category.localeCompare(b.category));
      });

      // Обновляем кеш конкретной категории
      queryClient.setQueryData(QUERY_KEYS.category(data.id), data);
      
      // Если имя категории изменилось, обновляем соответствующие кеши
      if (oldCategory?.category !== data.category) {
        // Удаляем старый кеш по имени
        if (oldCategory?.category) {
          queryClient.removeQueries({ 
            queryKey: QUERY_KEYS.categoryByName(oldCategory.category) 
          });
        }
        // Добавляем новый кеш по имени
        queryClient.setQueryData(QUERY_KEYS.categoryByName(data.category), data);
      }

      toast({
        title: "Категория обновлена",
        description: `Категория "${data.category}" успешно обновлена`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Хук для удаления категории
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<{ id: number; categoryName: string }> => {
      // Получаем данные категории
      const categories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories);
      const categoryToDelete = categories?.find(cat => cat.id === id);
      
      if (!categoryToDelete) {
        throw new Error("Категория не найдена");
      }

      const categoryName = categoryToDelete.category;

      // Удаляем связанные товары
      const { error: productsError } = await supabase
        .from("products")
        .delete()
        .eq("category", categoryName);

      if (productsError) throw productsError;

      // Удаляем изображение если есть
      if (categoryToDelete.image) {
        await deleteCategoryImage(categoryToDelete.image);
      }

      // Удаляем категорию
      const { error: categoryDeleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (categoryDeleteError) throw categoryDeleteError;

      return { id, categoryName };
    },
    onSuccess: ({ id, categoryName }) => {
      // Удаляем из кеша списка категорий
      queryClient.setQueryData<Category[]>(QUERY_KEYS.categories, (old) => {
        if (!old) return [];
        return old.filter(cat => cat.id !== id);
      });

      // Удаляем из кешей конкретной категории
      queryClient.removeQueries({ queryKey: QUERY_KEYS.category(id) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.categoryByName(categoryName) });

      // Инвалидируем кеш продуктов, так как они были удалены
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: "Категория удалена",
        description: "Категория и все её товары удалены.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Хук для массового импорта категорий
export const useBulkImportCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoriesData: Omit<Category, 'id' | 'created_at'>[]): Promise<BulkImportResult> => {
      const existingCategories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories) || [];
      const existingNames = new Set(existingCategories.map(cat => cat.category.toLowerCase()));
      
      const duplicates = categoriesData.filter(cat =>
        existingNames.has(cat.category.toLowerCase())
      );

      if (duplicates.length > 0) {
        const duplicateNames = duplicates.map(cat => cat.category).join(', ');
        throw new Error(`Найдены дубликаты: ${duplicateNames}`);
      }

      const categoriesToInsert = categoriesData.map(cat => ({
        category: cat.category,
        image: cat.image || null,
        mini_categories: cat.mini_categories || [],
        templates: cat.templates || []
      }));

      const { data, error } = await supabase
        .from("categories")
        .insert(categoriesToInsert)
        .select();

      if (error) throw error;

      return {
        success: true,
        imported: data.length,
        categories: data
      };
    },
    onSuccess: (result) => {
      // Обновляем кеш списка категорий
      queryClient.setQueryData<Category[]>(QUERY_KEYS.categories, (old) => {
        if (!old) return result.categories;
        return [...old, ...result.categories]
          .sort((a, b) => a.category.localeCompare(b.category));
      });

      // Добавляем новые категории в соответствующие кеши
      result.categories.forEach(category => {
        queryClient.setQueryData(QUERY_KEYS.category(category.id), category);
        queryClient.setQueryData(QUERY_KEYS.categoryByName(category.category), category);
      });

      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${result.imported} категорий`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка импорта",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Утилиты для работы с кешем категорий
export const useCategoryUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Получить категорию по ID из кеша
    getCategoryById: (id: number): Category | undefined => {
      const categories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories);
      return categories?.find(category => category.id === id);
    },

    // Получить категорию по имени из кеша
    getCategoryByName: (name: string): Category | undefined => {
      const categories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories);
      return categories?.find(category => 
        category.category.toLowerCase() === name.toLowerCase()
      );
    },

    // Получить все мини-категории
    getAllMiniCategories: (): string[] => {
      const categories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories);
      if (!categories) return [];
      
      const miniCategories = new Set<string>();
      categories.forEach(category => {
        category.mini_categories?.forEach(mini => {
          if (mini.trim()) miniCategories.add(mini.trim());
        });
      });
      
      return Array.from(miniCategories).sort();
    },

    // Получить все шаблоны
    getAllTemplates: (): string[] => {
      const categories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories);
      if (!categories) return [];
      
      const templates = new Set<string>();
      categories.forEach(category => {
        category.templates?.forEach(template => {
          if (template.trim()) templates.add(template.trim());
        });
      });
      
      return Array.from(templates).sort();
    },

    // Предзагрузить категории
    prefetchCategories: () => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.categories,
        queryFn: async () => {
          const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("category", { ascending: true });
          
          if (error) throw error;
          return data || [];
        },
      });
    },

    // Инвалидировать кеш категорий
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },

    // Очистить кеш категорий
    clearCategoriesCache: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.categories });
    },
  };
};

// Комбинированный хук для удобства (аналог оригинального useCategories)
export const useCategoriesWithMutations = () => {
  const categoriesQuery = useCategories();
  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const bulkImportMutation = useBulkImportCategories();
  const utils = useCategoryUtils();

  return {
    // Данные и состояние
    categories: categoriesQuery.data || [],
    loading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    
    // Мутации
    addCategory: addCategoryMutation.mutateAsync,
    onEdit: (id: number, formData: Partial<CategoryFormData> & { category: string }) => 
      updateCategoryMutation.mutateAsync({ id, formData }),
    deleteCategory: deleteCategoryMutation.mutateAsync,
    bulkImportCategories: bulkImportMutation.mutateAsync,
    
    // Состояние мутаций
    isAdding: addCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    isImporting: bulkImportMutation.isPending,
    
    // Утилиты
    getCategoryById: utils.getCategoryById,
    getCategoryByName: utils.getCategoryByName,
    getAllMiniCategories: utils.getAllMiniCategories,
    getAllTemplates: utils.getAllTemplates,
    
    // Рефетч
    refetch: categoriesQuery.refetch,
  };
};