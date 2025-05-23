
// hooks/useBrands.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Brand {
  id: number;
  name: string;
  image?: string;
  created_at?: string;
}

export interface BrandFormData {
  name: string;
  image: File | null;
  description?: string;
  website?: string;
}

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      
      setBrands(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки брендов",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadBrandImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Проверяем аутентификацию
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Необходимо войти в систему для загрузки изображений');
      }

      const { data, error: uploadError } = await supabase.storage
        .from('brands')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Ошибка загрузки: ${uploadError.message}`);
      }

      const { data: publicData } = supabase.storage
        .from('brands')
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (error: any) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const addBrand = async (formData: BrandFormData) => {
    try {
      let imageUrl = "";

      // Загружаем изображение если оно есть
      if (formData.image) {
        imageUrl = await uploadBrandImage(formData.image);
      }

      const { data, error } = await supabase
        .from("brands")
        .insert([{ 
          name: formData.name,
          image: imageUrl,
        }])
        .select()
        .single();

      if (error) throw error;

      setBrands(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Бренд добавлен",
        description: `Бренд "${formData.name}" успешно добавлен`,
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

  const updateBrand = async (id: number, formData: Partial<BrandFormData>) => {
    try {
      let updateData: any = {};

      // Если есть новое изображение, загружаем его
      if (formData.image) {
        const imageUrl = await uploadBrandImage(formData.image);
        updateData.image = imageUrl;
      }

      // Добавляем остальные поля
      if (formData.name !== undefined) updateData.name = formData.name;
      if (formData.description !== undefined) updateData.description = formData.description;
      if (formData.website !== undefined) updateData.website = formData.website;

      const { data, error } = await supabase
        .from("brands")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setBrands(prev => prev.map(brand => 
        brand.id === id ? data : brand
      ).sort((a, b) => a.name.localeCompare(b.name)));

      toast({
        title: "Бренд обновлен",
        description: `Бренд "${data.name}" успешно обновлен`,
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

  const deleteBrand = async (id: number) => {
    try {
      // Получаем данные бренда для удаления изображения
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .select("name, image")
        .eq("id", id)
        .single();

      if (brandError || !brandData) {
        throw new Error("Не удалось найти бренд для удаления.");
      }

      const brandName = brandData.name;

      // Проверяем, есть ли товары с этим брендом
      const { data: productsWithBrand, error: productsCheckError } = await supabase
        .from("products")
        .select("id")
        .eq("brand", brandName);

      if (productsCheckError) {
        throw new Error("Ошибка при проверке связанных товаров.");
      }

      // Если есть товары с этим брендом, предупреждаем пользователя
      if (productsWithBrand && productsWithBrand.length > 0) {
        // Обновляем товары, убирая у них бренд
        const { error: productsUpdateError } = await supabase
          .from("products")
          .update({ brand: null })
          .eq("brand", brandName);

        if (productsUpdateError) {
          throw new Error("Не удалось обновить связанные товары.");
        }
      }

      // Удаляем изображение из storage если оно есть
      if (brandData.image) {
        try {
          // Извлекаем имя файла из URL
          const imageUrl = new URL(brandData.image);
          const imagePath = imageUrl.pathname.split('/').pop();
          if (imagePath) {
            await supabase.storage
              .from('brands')
              .remove([imagePath]);
          }
        } catch (storageError) {
          console.warn('Не удалось удалить изображение из storage:', storageError);
          // Продолжаем удаление бренда даже если не удалось удалить изображение
        }
      }

      // Удаляем сам бренд
      const { error: brandDeleteError } = await supabase
        .from("brands")
        .delete()
        .eq("id", id);

      if (brandDeleteError) {
        throw new Error("Не удалось удалить бренд.");
      }

      setBrands(prev => prev.filter(brand => brand.id !== id));
      toast({
        title: "Бренд удален",
        description: `Бренд "${brandName}" был удален. У связанных товаров убран бренд.`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getBrandById = (id: number): Brand | undefined => {
    return brands.find(brand => brand.id === id);
  };

  const getBrandByName = (name: string): Brand | undefined => {
    return brands.find(brand => brand.name.toLowerCase() === name.toLowerCase());
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    addBrand,
    updateBrand,
    deleteBrand,
    getBrandById,
    getBrandByName,
    refetch: fetchBrands
  };
};