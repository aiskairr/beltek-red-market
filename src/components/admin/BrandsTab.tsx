// components/admin/CategoriesTab.tsx (обновленная версия)
import { BrandForm } from './BrandsForm';
import { BrandsTable } from './BrandsTable';
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