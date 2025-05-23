// components/admin/CategoryForm.tsx (обновленная версия)
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, X } from "lucide-react";
import { CategoryFormData } from '../../hooks/useCategories';
import { BrandFormData } from '@/hooks/useBrands';

interface BrandFormProps {
  onSubmit: (formData: BrandFormData) => Promise<void>;
  loading?: boolean;
}

export const BrandForm = ({ onSubmit, loading = false }: BrandFormProps) => {
  const [brandName, setBrandName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    if (!brandName.trim()) {
      alert('Введите название категории');
      return;
    }

    try {
      await onSubmit({
        name: brandName.trim(),
        image: selectedImage
      });

      // Сбрасываем форму после успешного добавления
      setBrandName("");
      setSelectedImage(null);
      setImagePreview(null);
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
            Название бренда *
          </Label>
          <Input
            id="category-name"
            placeholder="Введите название категории"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="mt-1"
          />
        </div>

        {/* Загрузка изображения */}
        <div>
          <Label htmlFor="category-image" className="text-sm font-medium">
            Изображение бренда (опционально)
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
            disabled={!brandName.trim() || loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Добавление...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Добавить бренд
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
