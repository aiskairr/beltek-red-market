// hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Characteristic {
  name: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  mini_category?: string;
  description: string;
  price: number;
  brand: string;
  image?: string;
  characteristics?: Characteristic[];
  created_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Обрабатываем characteristics - они могут быть строкой или уже объектом
      const parsedProducts = (data || []).map(product => ({
        ...product,
        characteristics: product.characteristics || []
      }));
      
      setProducts(parsedProducts);
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const onEdit = async (id?: number, formData?: Product) => {
    try {
      if (!id || !formData) return;

      let imageUrl = "";
      const image = formData.image as string | File;

      if (image instanceof File) {
        imageUrl = await uploadProductImage(image);
      } else {
        imageUrl = image;
      }

      // Подготавливаем данные для отправки
      const updateData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        image: imageUrl,
        brand: formData.brand,
        category: formData.category,
        mini_category: formData.mini_category || null,
        characteristics: formData.characteristics || [] // Отправляем как есть - Supabase автоматически обработает JSONB
      };

      console.log('Данные для обновления:', updateData); // Для отладки

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev =>
        prev
          .map(prod => (prod.id === id ? data : prod))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      toast({
        title: "Товар обновлён",
        description: `Товар "${formData.name}" успешно обновлён`,
      });

      return data;
    } catch (error: any) {
      console.error('Ошибка в onEdit:', error); // Для отладки
      toast({
        title: "Ошибка обновления товара",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      // Подготавливаем данные для отправки
      const insertData = {
        name: productData.name,
        category: productData.category,
        mini_category: productData.mini_category || null,
        brand: productData.brand,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        characteristics: productData.characteristics || [] // Отправляем как есть - Supabase автоматически обработает JSONB
      };

      console.log('Данные для добавления:', insertData); // Для отладки

      const { data, error } = await supabase
        .from("products")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Ошибка Supabase:', error); // Для отладки
        throw error;
      }

      setProducts(prev => [data, ...prev]);
      toast({
        title: "Товар добавлен",
        description: `${productData.name} успешно добавлен`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Ошибка в addProduct:', error); // Для отладки
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Товар удалён",
        description: `Товар с ID ${id} был удалён.`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    deleteProduct,
    onEdit,
    refetch: fetchProducts
  };
};