// hooks/useMoySkladCategories.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { 
  moySkladAPI, 
  transformMoySkladProductFolder,
  MoySkladProductFolder,
  getCategoriesWithCache,
  clearCategoriesCache
} from '@/lib/moysklad';

export interface Category {
  id: string;
  category: string;
  image?: string;
  mini_categories?: string[];
  templates?: string[];
  pathName?: string;
  archived?: boolean;
}

// Query keys
const QUERY_KEYS = {
  categories: ['moysklad-categories'],
  category: (id: string) => ['moysklad-categories', id],
  categoryByName: (name: string) => ['moysklad-categories', 'name', name],
} as const;

// Transform MoySklad folders to our category structure
const transformToCategories = (folders: MoySkladProductFolder[]): Category[] => {
  const categoryMap = new Map<string, Category>();

  console.log('=== TRANSFORMING CATEGORIES ===');
  console.log('Total folders:', folders.length);

  // First pass: create main categories
  folders.forEach(folder => {
    const transformed = transformMoySkladProductFolder(folder);
    
    if (transformed.isMainCategory && !transformed.archived) {
      // Используем имя категории как ключ, а не pathName (т.к. у всех главных категорий pathName пустой)
      const categoryName = transformed.name;
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          id: folder.id,
          category: transformed.name,
          pathName: transformed.name, // Для главной категории pathName = её имя
          mini_categories: [],
          templates: [],
          archived: transformed.archived,
        });
        console.log('Added main category:', transformed.name);
      }
    }
  });

  console.log('Main categories created:', categoryMap.size);

  // Second pass: add mini categories
  console.log('\n=== SECOND PASS: Adding subcategories ===');
  console.log('Available parent keys in map:', Array.from(categoryMap.keys()));
  
  folders.forEach(folder => {
    const transformed = transformMoySkladProductFolder(folder);
    
    if (!transformed.isMainCategory && !transformed.archived && transformed.parentPath) {
      console.log(`\nProcessing subcategory: "${transformed.name}"`);
      console.log(`  Looking for parent: "${transformed.parentPath}"`);
      
      const parentCategory = categoryMap.get(transformed.parentPath);
      
      if (parentCategory) {
        if (!parentCategory.mini_categories) {
          parentCategory.mini_categories = [];
        }
        if (!parentCategory.mini_categories.includes(transformed.name)) {
          parentCategory.mini_categories.push(transformed.name);
          console.log(`  ✓ Added to parent: "${parentCategory.category}"`);
        }
      } else {
        console.log(`  ✗ Parent NOT FOUND!`);
        console.log(`  Available keys:`, Array.from(categoryMap.keys()));
      }
    }
  });

  const result = Array.from(categoryMap.values()).sort((a, b) => 
    a.category.localeCompare(b.category)
  );
  
  console.log('Final categories with subcategories:');
  result.forEach(cat => {
    console.log(`  ${cat.category}: ${cat.mini_categories?.length || 0} subcategories`);
  });
  console.log('===============================');

  return result;
};

// Hook for all categories
export const useMoySkladCategories = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async (): Promise<Category[]> => {
      const folders = await getCategoriesWithCache();
      console.log('Raw folders from API:', folders.slice(0, 10)); // Показываем первые 10
      return transformToCategories(folders);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for single category
export const useMoySkladCategory = (id: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.category(id),
    queryFn: async (): Promise<Category> => {
      const folder = await moySkladAPI.getProductFolder(id);
      const transformed = transformMoySkladProductFolder(folder);
      
      return {
        id: folder.id,
        category: transformed.name,
        pathName: transformed.pathName,
        mini_categories: [],
        templates: [],
        archived: transformed.archived,
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for category by name
export const useMoySkladCategoryByName = (name: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.categoryByName(name),
    queryFn: async (): Promise<Category | null> => {
      const folders = await getCategoriesWithCache();
      const categories = transformToCategories(folders);
      
      return categories.find(cat => 
        cat.category.toLowerCase() === name.toLowerCase()
      ) || null;
    },
    enabled: !!name,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Utility hooks
export const useMoySkladCategoryUtils = () => {
  const queryClient = useQueryClient();

  return {
    getCategoryById: (id: string): Category | undefined => {
      const categories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories);
      return categories?.find(category => category.id === id);
    },

    getCategoryByName: (name: string): Category | undefined => {
      const categories = queryClient.getQueryData<Category[]>(QUERY_KEYS.categories);
      return categories?.find(category => 
        category.category.toLowerCase() === name.toLowerCase()
      );
    },

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

    prefetchCategories: () => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.categories,
        queryFn: async () => {
          const folders = await getCategoriesWithCache();
          return transformToCategories(folders);
        },
      });
    },

    invalidateCategories: () => {
      clearCategoriesCache();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories });
    },

    clearCategoriesCache: () => {
      clearCategoriesCache();
      queryClient.removeQueries({ queryKey: QUERY_KEYS.categories });
    },
  };
};

// Combined hook for convenience (read-only for MoySklad)
export const useMoySkladCategoriesWithMutations = () => {
  const categoriesQuery = useMoySkladCategories();
  const utils = useMoySkladCategoryUtils();

  return {
    // Data and state
    categories: categoriesQuery.data || [],
    loading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    
    // Note: MoySklad is read-only, no mutations available
    // These are kept for compatibility but will show warnings
    addCategory: async () => {
      console.warn('Adding categories is not supported with MoySklad API. Please use MoySklad interface.');
      throw new Error('Adding categories is not supported with MoySklad API');
    },
    onEdit: async () => {
      console.warn('Editing categories is not supported with MoySklad API. Please use MoySklad interface.');
      throw new Error('Editing categories is not supported with MoySklad API');
    },
    deleteCategory: async () => {
      console.warn('Deleting categories is not supported with MoySklad API. Please use MoySklad interface.');
      throw new Error('Deleting categories is not supported with MoySklad API');
    },
    bulkImportCategories: async () => {
      console.warn('Bulk import is not supported with MoySklad API. Please use MoySklad interface.');
      throw new Error('Bulk import is not supported with MoySklad API');
    },
    
    // State flags (always false for read-only)
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
    isImporting: false,
    
    // Utils
    getCategoryById: utils.getCategoryById,
    getCategoryByName: utils.getCategoryByName,
    getAllMiniCategories: utils.getAllMiniCategories,
    getAllTemplates: utils.getAllTemplates,
    
    // Refetch
    refetch: categoriesQuery.refetch,
  };
};
