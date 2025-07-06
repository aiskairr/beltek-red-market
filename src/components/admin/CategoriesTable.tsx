// components/admin/CategoriesTable.tsx (обновленная версия с редактированием шаблонов)
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Edit, Trash, Image as ImageIcon, X, Plus, Minus, FileText } from "lucide-react";
import { Category } from '../../hooks/useCategories';

interface CategoriesTableProps {
  categories: Category[];
  onDelete: (id: number) => void;
  onEdit?: any;
  loading?: boolean;
}

export const CategoriesTable = ({ categories, onDelete, onEdit, loading = false }: CategoriesTableProps) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    image: '',
    mini_categories: [] as string[],
    templates: [] as string[]
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      category: category.category,
      image: category.image || '',
      mini_categories: category.mini_categories || [],
      templates: Array.isArray(category.templates) ? category.templates : []
    });
    setImagePreview(category.image || '');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ category: '', image: '', mini_categories: [], templates: [] });
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addMiniCategory = () => {
    setFormData(prev => ({
      ...prev,
      mini_categories: [...prev.mini_categories, '']
    }));
  };

  const removeMiniCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mini_categories: prev.mini_categories.filter((_, i) => i !== index)
    }));
  };

  const updateMiniCategory = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      mini_categories: prev.mini_categories.map((cat, i) => i === index ? value : cat)
    }));
  };

  // Функции для работы с шаблонами
  const addTemplate = () => {
    setFormData(prev => ({
      ...prev,
      templates: [...prev.templates, '']
    }));
  };

  const removeTemplate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      templates: prev.templates.filter((_, i) => i !== index)
    }));
  };

  const updateTemplate = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      templates: prev.templates.map((template, i) => i === index ? value : template)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory && onEdit) {
      const updatedCategory: Category = {
        ...editingCategory,
        category: formData.category,
        image: formData.image,
        mini_categories: formData.mini_categories.filter(cat => cat.trim() !== ''),
        templates: formData.templates.filter(template => template.trim() !== '')
      };
      onEdit(editingCategory.id, updatedCategory);
      handleModalClose();
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-belek-red mx-auto"></div>
          <p className="mt-2 text-gray-500">Загрузка категорий...</p>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Категории не найдены</p>
          <p className="text-sm text-gray-400">Добавьте первую категорию выше</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Изображение</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Мини-категории</TableHead>
                <TableHead>Шаблоны</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.id}</TableCell>
                  <TableCell>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.category}
                        className="h-12 w-12 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.category}</TableCell>
                  <TableCell>
                    {category.mini_categories && category.mini_categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {category.mini_categories.map((miniCat, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {miniCat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Нет мини-категорий</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(category.templates) && category.templates.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {category.templates.map((template, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {template}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Нет шаблонов</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.created_at 
                      ? new Date(category.created_at).toLocaleDateString('ru-RU')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onEdit && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:border-red-300"
                        onClick={() => {
                          if (confirm(`Вы уверены, что хотите удалить категорию "${category.category}"? Это также удалит все товары в этой категории.`)) {
                            onDelete(category.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Модальное окно редактирования */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать категорию</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category-name">Название категории</Label>
              <Input
                id="category-name"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Введите название категории"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Изображение категории</Label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Предпросмотр"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Изображение не выбрано</p>
                </div>
              )}
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2"
              />
            </div>

            {/* Секция мини-категорий */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Мини-категории</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMiniCategory}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Добавить
                </Button>
              </div>
              
              {formData.mini_categories.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Мини-категории не добавлены
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.mini_categories.map((miniCat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={miniCat}
                        onChange={(e) => updateMiniCategory(index, e.target.value)}
                        placeholder={`Мини-категория ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMiniCategory(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Секция шаблонов */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Шаблоны</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTemplate}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Добавить шаблон
                </Button>
              </div>
              
              {formData.templates.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Шаблоны не добавлены
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.templates.map((template, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          value={template}
                          onChange={(e) => updateTemplate(index, e.target.value)}
                          placeholder={`Шаблон ${index + 1}`}
                          className="flex-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTemplate(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-belek-red hover:bg-belek-red/90"
              >
                Сохранить изменения
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};