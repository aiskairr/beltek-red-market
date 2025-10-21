// hooks/useMoySkladBrands.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { moySkladAPI } from '@/lib/moysklad';

export interface Brand {
  id: string;
  name: string;
  image?: string;
  description?: string;
  website?: string;
  created_at?: string;
}

export interface BrandFormData {
  name: string;
  image: File | null;
}

// Query keys
const QUERY_KEYS = {
  brands: ['moysklad-brands'],
  brand: (id: string) => ['moysklad-brands', id],
} as const;

// Extract unique brands from products
const extractBrandsFromProducts = async (): Promise<Brand[]> => {
  try {
    // Fetch all products to extract brands
    const response = await moySkladAPI.getProducts({ limit: 1000 });
    
    const brandSet = new Set<string>();
    const brandMap = new Map<string, Brand>();

    // Look for brand in product attributes
    response.rows.forEach(product => {
      // Check if there's a brand attribute
      const brandAttr = product.attributes?.find(
        attr => attr.name.toLowerCase() === 'бренд' || 
                attr.name.toLowerCase() === 'brand' ||
                attr.name.toLowerCase() === 'производитель'
      );

      if (brandAttr && brandAttr.value) {
        const brandName = String(brandAttr.value).trim();
        if (brandName && !brandSet.has(brandName)) {
          brandSet.add(brandName);
          brandMap.set(brandName, {
            id: brandName.toLowerCase().replace(/\s+/g, '-'),
            name: brandName,
            created_at: new Date().toISOString(),
          });
        }
      }
    });

    return Array.from(brandMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  } catch (error) {
    console.error('Failed to extract brands:', error);
    return [];
  }
};

// Hook for all brands
export const useMoySkladBrands = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: extractBrandsFromProducts,
    staleTime: 10 * 60 * 1000, // 10 minutes (brands change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for single brand
export const useMoySkladBrand = (id: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.brand(id),
    queryFn: async (): Promise<Brand | null> => {
      const brands = await extractBrandsFromProducts();
      return brands.find(brand => brand.id === id) || null;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// Utility hooks
export const useMoySkladBrandUtils = () => {
  const queryClient = useQueryClient();

  return {
    getBrandById: (id: string): Brand | undefined => {
      const brands = queryClient.getQueryData<Brand[]>(QUERY_KEYS.brands);
      return brands?.find(brand => brand.id === id);
    },

    getBrandByName: (name: string): Brand | undefined => {
      const brands = queryClient.getQueryData<Brand[]>(QUERY_KEYS.brands);
      return brands?.find(brand => brand.name.toLowerCase() === name.toLowerCase());
    },

    prefetchBrands: () => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.brands,
        queryFn: extractBrandsFromProducts,
      });
    },

    invalidateBrands: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands });
    },

    clearBrandsCache: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.brands });
    },
  };
};

// Combined hook for convenience (read-only for MoySklad)
export const useMoySkladBrandsWithMutations = () => {
  const brandsQuery = useMoySkladBrands();
  const utils = useMoySkladBrandUtils();

  return {
    // Data and state
    brands: brandsQuery.data || [],
    loading: brandsQuery.isLoading,
    error: brandsQuery.error,
    
    // Note: MoySklad brands are read-only (extracted from products)
    // These are kept for compatibility but will show warnings
    addBrand: async () => {
      console.warn('Adding brands is not supported with MoySklad API. Brands are extracted from product attributes.');
      throw new Error('Adding brands is not supported with MoySklad API');
    },
    updateBrand: async () => {
      console.warn('Updating brands is not supported with MoySklad API. Update product attributes instead.');
      throw new Error('Updating brands is not supported with MoySklad API');
    },
    deleteBrand: async () => {
      console.warn('Deleting brands is not supported with MoySklad API. Brands are extracted from products.');
      throw new Error('Deleting brands is not supported with MoySklad API');
    },
    
    // State flags (always false for read-only)
    isAdding: false,
    isUpdating: false,
    isDeleting: false,
    
    // Utils
    getBrandById: utils.getBrandById,
    getBrandByName: utils.getBrandByName,
    
    // Refetch
    refetch: brandsQuery.refetch,
  };
};
