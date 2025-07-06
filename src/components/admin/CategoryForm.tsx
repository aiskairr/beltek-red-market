// components/admin/CategoryForm.tsx (обновленная версия с подкатегориями и шаблонами)
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, X } from "lucide-react";
import { CategoryFormData } from '../../hooks/useCategories';

interface CategoryFormProps {
  onSubmit:any;
  loading?: boolean;
}

export const CategoryForm = ({ onSubmit, loading = false }: CategoryFormProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [templateInput, setTemplateInput] = useState("");
  const [templates, setTemplates] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Сбрасываем input
    const input = document.getElementById('category-image') as HTMLInputElement;
    if (input) input.value = '';
  };

  const addSubcategory = () => {
    const trimmedSubcategory = subcategoryInput.trim();
    if (!trimmedSubcategory) {
      alert('Введите название подкатегории');
      return;
    }
    
    if (subcategories.includes(trimmedSubcategory)) {
      alert('Такая подкатегория уже добавлена');
      return;
    }

    setSubcategories(prev => [...prev, trimmedSubcategory]);
    setSubcategoryInput("");
  };

  const removeSubcategory = (indexToRemove: number) => {
    setSubcategories(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubcategoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      addSubcategory();
    }
  };

  const addTemplate = () => {
    const trimmedTemplate = templateInput.trim();
    if (!trimmedTemplate) {
      alert('Введите шаблон');
      return;
    }
    
    if (templates.includes(trimmedTemplate)) {
      alert('Такой шаблон уже добавлен');
      return;
    }

    setTemplates(prev => [...prev, trimmedTemplate]);
    setTemplateInput("");
  };

  const removeTemplate = (indexToRemove: number) => {
    setTemplates(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleTemplateKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      addTemplate();
    }
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      alert('Введите название категории');
      return;
    }
    
    try {
      await onSubmit({
        category: categoryName.trim(),
        image: selectedImage,
        mini_categories: subcategories,
        templates: templates
      });
      
      // Сбрасываем форму после успешного добавления
      setCategoryName("");
      setSelectedImage(null);
      setImagePreview(null);
      setSubcategoryInput("");
      setSubcategories([]);
      setTemplateInput("");
      setTemplates([]);
      const input = document.getElementById('category-image') as HTMLInputElement;
      if (input) input.value = '';
    } catch (error) {
      // Ошибка уже обработана в хуке
      console.error('Error adding category:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <Card className="mb-4 p-4">
      <h3 className="text-lg font-semibold mb-4">Добавить категорию</h3>
      
      <div className="space-y-4">
        {/* Название категории */}
        <div>
          <Label htmlFor="category-name" className="text-sm font-medium">
            Название категории *
          </Label>
          <Input
            id="category-name"
            placeholder="Введите название категории"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="mt-1"
          />
        </div>

        {/* Подкатегории */}
        <div>
          <Label htmlFor="subcategory-input" className="text-sm font-medium">
            Подкатегории (опционально)
          </Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="subcategory-input"
              placeholder="Введите название подкатегории"
              value={subcategoryInput}
              onChange={(e) => setSubcategoryInput(e.target.value)}
              onKeyPress={handleSubcategoryKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addSubcategory}
              disabled={!subcategoryInput.trim() || loading}
              className="bg-belek-red hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Отображение добавленных подкатегорий */}
          {subcategories.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Добавленные подкатегории:</p>
              <div className="flex flex-wrap gap-2">
                {subcategories.map((subcategory, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{subcategory}</span>
                    <Button
                      type="button"
                      onClick={() => removeSubcategory(index)}
                      disabled={loading}
                      className="h-4 w-4 p-0 bg-transparent hover:bg-red-100 text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Шаблоны */}
        <div>
          <Label htmlFor="template-input" className="text-sm font-medium">
            Шаблоны (опционально)
          </Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="template-input"
              placeholder="Введите шаблон"
              value={templateInput}
              onChange={(e) => setTemplateInput(e.target.value)}
              onKeyPress={handleTemplateKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addTemplate}
              disabled={!templateInput.trim() || loading}
              className="bg-belek-red hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Отображение добавленных шаблонов */}
          {templates.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Добавленные шаблоны:</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((template, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{template}</span>
                    <Button
                      type="button"
                      onClick={() => removeTemplate(index)}
                      disabled={loading}
                      className="h-4 w-4 p-0 bg-transparent hover:bg-red-100 text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Загрузка изображения */}
        <div>
          <Label htmlFor="category-image" className="text-sm font-medium">
            Изображение категории (опционально)
          </Label>
          <div className="mt-1">
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <Label 
                      htmlFor="category-image" 
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-belek-red hover:bg-red-700"
                    >
                      Выбрать изображение
                    </Label>
                    <Input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF до 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Превью категории"
                  className="h-32 w-32 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImage}
                  disabled={loading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка добавления */}
        <div className="flex justify-end">
          <Button
            className="bg-belek-red hover:bg-red-700"
            onClick={handleSubmit}
            disabled={!categoryName.trim() || loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Добавление...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Добавить категорию
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};