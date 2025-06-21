// hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Template {
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
  image?: string; // Главное изображение (для обратной совместимости)
  images?: string[]; // Массив всех изображений
  templates?: Template[]; // Заменили characteristics на templates
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
      
      // Обрабатываем templates и images
      const parsedProducts = (data || []).map(product => ({
        ...product,
        templates: product.templates || [], // Заменили characteristics на templates
        images: product.images || [],
        // Устанавливаем главное изображение если его нет, но есть массив изображений
        image: product.image || (product.images && product.images.length > 0 ? product.images[0] : '')
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

  const onEdit = async (id?: number, formData?: any) => {
    try {
      if (!id || !formData) return;

      // Обрабатываем изображения
      let imageUrls: string[] = [];
      let mainImageUrl = "";

      if (formData.images && Array.isArray(formData.images)) {
        imageUrls = formData.images;
        mainImageUrl = imageUrls[0] || "";
      } else if (formData.image) {
        // Обратная совместимость для одного изображения
        if (formData.image instanceof File) {
          mainImageUrl = await uploadProductImage(formData.image);
          imageUrls = [mainImageUrl];
        } else {
          mainImageUrl = formData.image;
          imageUrls = [mainImageUrl];
        }
      }

      // Подготавливаем данные для отправки
      const updateData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        image: mainImageUrl, // Главное изображение
        images: imageUrls, // Массив всех изображений
        brand: formData.brand,
        category: formData.category,
        mini_category: formData.mini_category || null,
        templates: formData.templates || [] // Заменили characteristics на templates
      };

      console.log('Данные для обновления:', updateData);

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
      console.error('Ошибка в onEdit:', error);
      toast({
        title: "Ошибка обновления товара",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addProduct = async (productData: any) => {
    try {
      // Подготавливаем данные для отправки
      const insertData = {
        name: productData.name,
        category: productData.category,
        mini_category: productData.mini_category || null,
        brand: productData.brand,
        description: productData.description,
        price: productData.price,
        image: productData.image || "", // Главное изображение (для обратной совместимости)
        images: productData.images || [], // Массив всех изображений
        templates: productData.templates || [] // Заменили characteristics на templates
      };

      console.log('Данные для добавления:', insertData);

      const { data, error } = await supabase
        .from("products")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Ошибка Supabase:', error);
        throw error;
      }

      setProducts(prev => [data, ...prev]);
      toast({
        title: "Товар добавлен",
        description: `${productData.name} успешно добавлен`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Ошибка в addProduct:', error);
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
      // Получаем информацию о товаре перед удалением для очистки изображений
      const { data: productToDelete } = await supabase
        .from("products")
        .select("images, image")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Опционально: удаляем изображения из storage
      if (productToDelete?.images && Array.isArray(productToDelete.images)) {
        const deletePromises = productToDelete.images.map(async (imageUrl: string) => {
          try {
            // Извлекаем путь к файлу из URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `products/${fileName}`;
            
            await supabase.storage
              .from('products')
              .remove([filePath]);
          } catch (error) {
            console.warn('Не удалось удалить изображение:', imageUrl, error);
          }
        });
        
        await Promise.all(deletePromises);
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Товар удалён",
        description: `Товар с ID ${id} был удалён.`,
      });
    } catch (error: any) {
      console.error('Ошибка при удалении товара:', error);
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