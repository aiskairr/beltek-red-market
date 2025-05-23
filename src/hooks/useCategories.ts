// hooks/useCategories.ts (обновленная версия)
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Category {
  id: number;
  category: string;
  image?: string;
  created_at?: string;
}

export interface CategoryFormData {
  category: string;
  image: File | null;
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
      
      setCategories(data || []);
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
          image: imageUrl 
        }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data].sort((a, b) => a.category.localeCompare(b.category)));
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

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    refetch: fetchCategories
  };
};