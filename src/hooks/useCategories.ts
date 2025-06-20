// hooks/useCategories.ts (обновленная версия с полной поддержкой шаблонов)
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: number;
  category: string;
  image?: string;
  mini_categories?: string[];
  templates?: string[];
  created_at?: string;
}

export interface CategoryFormData {
  category: string;
  image: File | null;
  mini_categories: string[];
  templates: string[];
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;

      // Приводим данные к нужному формату
      const formattedData = (data || []).map(cat => ({
        ...cat,
        mini_categories: cat.mini_categories || [],
        templates: Array.isArray(cat.templates) ? cat.templates : []
      }));

      setCategories(formattedData);
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки категорий",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadCategoryImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('categories')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addCategory = async (formData: CategoryFormData) => {
    try {
      let imageUrl = "";

      // Загружаем изображение если оно есть
      if (formData.image) {
        imageUrl = await uploadCategoryImage(formData.image);
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([{
          category: formData.category,
          image: imageUrl,
          mini_categories: formData.mini_categories.filter(cat => cat.trim() !== ''),
          templates: formData.templates.filter(template => template.trim() !== '')
        }])
        .select()
        .single();

      if (error) throw error;

      const newCategory = {
        ...data,
        mini_categories: data.mini_categories || [],
        templates: Array.isArray(data.templates) ? data.templates : []
      };

      setCategories(prev => [...prev, newCategory].sort((a, b) => a.category.localeCompare(b.category)));
      toast({
        title: "Категория добавлена",
        description: `Категория "${formData.category}" успешно добавлена`,
      });

      return newCategory;
    } catch (error: any) {
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const onEdit = async (id?: number, formData?: Category) => {
    try {
      if (!id || !formData) return;

      let imageUrl = "";
      const image = formData.image as string | File;
      if (image instanceof File) {
        imageUrl = await uploadCategoryImage(image);
      } else {
        imageUrl = image;
      }

      const { data, error } = await supabase
        .from("categories")
        .update({
          category: formData.category,
          image: imageUrl,
          mini_categories: formData.mini_categories || [],
          templates: formData.templates || []
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedCategory = {
        ...data,
        mini_categories: data.mini_categories || [],
        templates: Array.isArray(data.templates) ? data.templates : []
      };

      setCategories(prev =>
        prev
          .map(cat => (cat.id === id ? updatedCategory : cat))
          .sort((a, b) => a.category.localeCompare(b.category))
      );

      toast({
        title: "Категория обновлена",
        description: `Категория "${formData.category}" успешно обновлена`,
      });

      return updatedCategory;
    } catch (error: any) {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      // Получаем данные категории для удаления изображения
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("category, image")
        .eq("id", id)
        .single();

      if (categoryError || !categoryData) {
        throw new Error("Не удалось найти категорию для удаления.");
      }

      const categoryName = categoryData.category;

      // Удаляем связанные товары
      const { error: productsError } = await supabase
        .from("products")
        .delete()
        .eq("category", categoryName);

      if (productsError) {
        throw new Error("Не удалось удалить связанные товары.");
      }

      // Удаляем изображение из storage если оно есть
      if (categoryData.image) {
        const imagePath = categoryData.image.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('categories')
            .remove([`categories/${imagePath}`]);
        }
      }

      // Удаляем саму категорию
      const { error: categoryDeleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (categoryDeleteError) {
        throw new Error("Не удалось удалить категорию.");
      }

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Категория удалена",
        description: "Категория и все её товары удалены.",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Массовый импорт категорий из Excel
  const bulkImportCategories = async (categoriesData: Omit<Category, 'id' | 'created_at'>[]) => {
    try {
      setLoading(true);

      // Проверяем на дубликаты с существующими категориями
      const existingCategories = categories.map(cat => cat.category.toLowerCase());
      const duplicates = categoriesData.filter(cat =>
        existingCategories.includes(cat.category.toLowerCase())
      );

      if (duplicates.length > 0) {
        const duplicateNames = duplicates.map(cat => cat.category).join(', ');
        throw new Error(`Найдены дубликаты категорий: ${duplicateNames}`);
      }

      // Подготавливаем данные для вставки
      const categoriesToInsert = categoriesData.map(cat => ({
        category: cat.category,
        image: cat.image || null,
        mini_categories: cat.mini_categories || [],
        templates: cat.templates || []
      }));

      // Вставляем все категории одним запросом
      const { data, error } = await supabase
        .from("categories")
        .insert(categoriesToInsert)
        .select();

      if (error) throw error;

      // Форматируем полученные данные
      const formattedData = data.map(cat => ({
        ...cat,
        mini_categories: cat.mini_categories || [],
        templates: Array.isArray(cat.templates) ? cat.templates : []
      }));

      // Обновляем локальное состояние
      setCategories(prev =>
        [...prev, ...formattedData].sort((a, b) => a.category.localeCompare(b.category))
      );

      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${data.length} категорий`,
      });

      return {
        success: true,
        imported: data.length,
        categories: formattedData
      };
    } catch (error: any) {
      toast({
        title: "Ошибка импорта",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    onEdit,
    bulkImportCategories,
    refetch: fetchCategories
  };
};