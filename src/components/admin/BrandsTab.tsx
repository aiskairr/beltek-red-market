// components/admin/CategoriesTab.tsx (обновленная версия)
import { CategoryForm } from './CategoryForm';
import { CategoriesTable } from './CategoriesTable';
import { useCategories } from '../../hooks/useCategories';
import { BrandForm } from './BrandsForm';
import { BrandsTable } from './Brandstable';
import { useBrands } from '@/hooks/useBrands';

export const BrandsTab = () => {
  const { brands, loading, addBrand, deleteBrand } = useBrands();

  return (
    <div className="space-y-6">
      <BrandForm onSubmit={addBrand} loading={loading} />
      <BrandsTable
        brands={brands}
        onDelete={deleteBrand}
        loading={loading}
      />
    </div>
  );
};