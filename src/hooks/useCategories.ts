// hooks/useCategories.ts (оптимизированная версия)
import { useState, useEffect, useCallback } from 'react';
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

  // Мемоизированная функция загрузки
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      // Упрощенный запрос без дополнительной сортировки на клиенте
      const { data, error } = await supabase
        .from("categories")
        .select("id, category, image, mini_categories, templates, created_at")
        .order("category", { ascending: true });

      if (error) throw error;

      // Минимальная обработка данных - только если действительно необходимо
      setCategories(data || []);
      
    } catch (error: any) {
      console.error('Ошибка загрузки категорий:', error);
      toast({
        title: "Ошибка загрузки категорий",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const uploadCategoryImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('categories')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('categories')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const addCategory = async (formData: CategoryFormData) => {
    try {
      let imageUrl = "";

      if (formData.image) {
        imageUrl = await uploadCategoryImage(formData.image);
      }

      const { data, error } = await supabase
        .from("categories")
        .insert([{
          category: formData.category,
          image: imageUrl,
          mini_categories: formData.mini_categories.filter(cat => cat.trim()),
          templates: formData.templates.filter(template => template.trim())
        }])
        .select()
        .single();

      if (error) throw error;

      // Простое добавление без пересортировки
      setCategories(prev => {
        const newCategories = [...prev, data];
        return newCategories.sort((a, b) => a.category.localeCompare(b.category));
      });

      toast({
        title: "Категория добавлена",
        description: `Категория "${formData.category}" успешно добавлена`,
      });

      return data;
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
        imageUrl = image || "";
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

      setCategories(prev =>
        prev.map(cat => cat.id === id ? data : cat)
          .sort((a, b) => a.category.localeCompare(b.category))
      );

      toast({
        title: "Категория обновлена",
        description: `Категория "${formData.category}" успешно обновлена`,
      });

      return data;
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
      const categoryToDelete = categories.find(cat => cat.id === id);
      if (!categoryToDelete) {
        throw new Error("Категория не найдена");
      }

      const categoryName = categoryToDelete.category;

      // Используем транзакцию для удаления связанных данных
      const { error: productsError } = await supabase
        .from("products")
        .delete()
        .eq("category", categoryName);

      if (productsError) throw productsError;

      // Удаляем изображение если есть
      if (categoryToDelete.image) {
        const imagePath = categoryToDelete.image.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('categories')
            .remove([`categories/${imagePath}`]);
        }
      }

      const { error: categoryDeleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (categoryDeleteError) throw categoryDeleteError;

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

  const bulkImportCategories = async (categoriesData: Omit<Category, 'id' | 'created_at'>[]) => {
    try {
      setLoading(true);

      const existingNames = new Set(categories.map(cat => cat.category.toLowerCase()));
      const duplicates = categoriesData.filter(cat =>
        existingNames.has(cat.category.toLowerCase())
      );

      if (duplicates.length > 0) {
        const duplicateNames = duplicates.map(cat => cat.category).join(', ');
        throw new Error(`Найдены дубликаты: ${duplicateNames}`);
      }

      const categoriesToInsert = categoriesData.map(cat => ({
        category: cat.category,
        image: cat.image || null,
        mini_categories: cat.mini_categories || [],
        templates: cat.templates || []
      }));

      const { data, error } = await supabase
        .from("categories")
        .insert(categoriesToInsert)
        .select();

      if (error) throw error;

      setCategories(prev =>
        [...prev, ...data].sort((a, b) => a.category.localeCompare(b.category))
      );

      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${data.length} категорий`,
      });

      return {
        success: true,
        imported: data.length,
        categories: data
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
  }, [fetchCategories]);

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