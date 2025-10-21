// hooks/useBrands.ts - Now using MoySklad API
export * from './useMoySkladBrands';

// Re-export for backward compatibility
export { 
  useMoySkladBrands as useBrands,
  useMoySkladBrand as useBrand,
  useMoySkladBrandUtils as useBrandUtils,
  useMoySkladBrandsWithMutations as useBrandsWithMutations
} from './useMoySkladBrands';
