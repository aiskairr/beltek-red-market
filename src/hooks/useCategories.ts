// hooks/useCategories.ts - Now using MoySklad API
export * from './useMoySkladCategories';

// Re-export for backward compatibility
export { 
  useMoySkladCategories as useCategories,
  useMoySkladCategory as useCategory,
  useMoySkladCategoryByName as useCategoryByName,
  useMoySkladCategoryUtils as useCategoryUtils,
  useMoySkladCategoriesWithMutations as useCategoriesWithMutations
} from './useMoySkladCategories';
