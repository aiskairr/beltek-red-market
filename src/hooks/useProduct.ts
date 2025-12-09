// hooks/useProduct.ts - Now using MoySklad API
export * from './useMoySkladProducts';

// Re-export for backward compatibility
export {
  useMoySkladProducts as useProducts,
  useMoySkladProduct as useProduct,
  useMoySkladProductsByCategory as useProductsByCategory,
  useInfiniteMoySkladProducts as useInfiniteProducts,
  useMoySkladProductUtils as useProductUtils,
  useMoySkladProductsWithMutations as useProductsWithMutations,
  useMoySkladProductVariants as useProductVariants
} from './useMoySkladProducts';

// Stub mutations for admin components (read-only with MoySklad)
export const useAddProduct = () => ({
  mutateAsync: async () => {
    throw new Error('Adding products is not supported with MoySklad API. Please use MoySklad interface.');
  },
  isPending: false
});

export const useUpdateProduct = () => ({
  mutateAsync: async () => {
    throw new Error('Updating products is not supported with MoySklad API. Please use MoySklad interface.');
  },
  isPending: false
});

export const useDeleteProduct = () => ({
  mutateAsync: async () => {
    throw new Error('Deleting products is not supported with MoySklad API. Please use MoySklad interface.');
  },
  isPending: false
});

export const useBulkDeleteProducts = () => ({
  mutateAsync: async () => {
    throw new Error('Bulk delete is not supported with MoySklad API. Please use MoySklad interface.');
  },
  isPending: false
});
