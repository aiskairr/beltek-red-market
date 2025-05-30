// components/admin/CategoriesTab.tsx (обновленная версия)
import { CategoryForm } from './CategoryForm';
import { CategoriesTable } from './CategoriesTable';
import { useCategories } from '../../hooks/useCategories';

export const CategoriesTab = () => {
  const { categories, loading, addCategory, deleteCategory, onEdit } = useCategories();

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