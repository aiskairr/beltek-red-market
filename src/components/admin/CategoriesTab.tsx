// components/admin/CategoriesTab.tsx (обновленная версия)
import { CategoryForm } from './CategoryForm';
import { CategoriesTable } from './CategoriesTable';
import { useCategoriesWithMutations } from '../../hooks/useCategories';

export const CategoriesTab = () => {
  const { categories, loading, addCategory, deleteCategory, onEdit } = useCategoriesWithMutations();

  return (
    <div className="space-y-6">
      <CategoryForm onSubmit={addCategory} loading={loading} />
      <CategoriesTable
        categories={categories}
        onDelete={deleteCategory}
        onEdit={onEdit}
        loading={loading}
      />
    </div>
  );
};