// hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

export interface Brand {
  id: number;
  name: string;
  image?: string;
  description?: string;
  website?: string;
  created_at?: string;
}

export interface BrandFormData {
  name: string;
  image: File | null;
}

// Ключи для кеширования
const QUERY_KEYS = {
  brands: ['brands'],
  brand: (id: number) => ['brands', id],
} as const;

// Утилиты для работы с изображениями
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

const deleteBrandImage = async (imageUrl: string) => {
  try {
    const url = new URL(imageUrl);
    const imagePath = url.pathname.split('/').pop();
    if (imagePath) {
      await supabase.storage
        .from('brands')
        .remove([imagePath]);
    }
  } catch (error) {
    console.warn('Не удалось удалить изображение из storage:', error);
  }
};

// Основной хук для получения всех брендов
export const useBrands = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: async (): Promise<Brand[]> => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) {
        toast({
          title: "Ошибка загрузки брендов",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения конкретного бренда
export const useBrand = (id: number) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: QUERY_KEYS.brand(id),
    queryFn: async (): Promise<Brand> => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        toast({
          title: "Ошибка загрузки бренда",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Хук для добавления бренда
export const useAddBrand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: BrandFormData): Promise<Brand> => {
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
      
      return data;
    },
    onSuccess: (data) => {
      // Обновляем кеш списка брендов
      queryClient.setQueryData<Brand[]>(QUERY_KEYS.brands, (old) => {
        if (!old) return [data];
        return [...old, data].sort((a, b) => a.name.localeCompare(b.name));
      });

      // Добавляем новый бренд в кеш
      queryClient.setQueryData(QUERY_KEYS.brand(data.id), data);

      toast({
        title: "Бренд добавлен",
        description: `Бренд "${data.name}" успешно добавлен`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Хук для обновления бренда
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: Partial<BrandFormData> }): Promise<Brand> => {
      let updateData: any = {};

      // Если есть новое изображение, загружаем его
      if (formData.image) {
        const imageUrl = await uploadBrandImage(formData.image);
        updateData.image = imageUrl;
      }

      // Добавляем остальные поля
      if (formData.name !== undefined) updateData.name = formData.name;

      const { data, error } = await supabase
        .from("brands")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      // Обновляем кеш списка брендов
      queryClient.setQueryData<Brand[]>(QUERY_KEYS.brands, (old) => {
        if (!old) return [data];
        return old.map(brand => 
          brand.id === data.id ? data : brand
        ).sort((a, b) => a.name.localeCompare(b.name));
      });

      // Обновляем кеш конкретного бренда
      queryClient.setQueryData(QUERY_KEYS.brand(data.id), data);

      toast({
        title: "Бренд обновлен",
        description: `Бренд "${data.name}" успешно обновлен`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Хук для удаления бренда
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number): Promise<{ id: number; name: string }> => {
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

      // Если есть товары с этим брендом, обновляем их
      if (productsWithBrand && productsWithBrand.length > 0) {
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
        await deleteBrandImage(brandData.image);
      }

      // Удаляем сам бренд
      const { error: brandDeleteError } = await supabase
        .from("brands")
        .delete()
        .eq("id", id);

      if (brandDeleteError) {
        throw new Error("Не удалось удалить бренд.");
      }

      return { id, name: brandName };
    },
    onSuccess: ({ id, name }) => {
      // Удаляем из кеша списка брендов
      queryClient.setQueryData<Brand[]>(QUERY_KEYS.brands, (old) => {
        if (!old) return [];
        return old.filter(brand => brand.id !== id);
      });

      // Удаляем из кеша конкретного бренда
      queryClient.removeQueries({ queryKey: QUERY_KEYS.brand(id) });

      // Инвалидируем кеш продуктов, так как у них мог измениться бренд
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: "Бренд удален",
        description: `Бренд "${name}" был удален. У связанных товаров убран бренд.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Утилиты для работы с кешем брендов
export const useBrandUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Получить бренд по ID из кеша
    getBrandById: (id: number): Brand | undefined => {
      const brands = queryClient.getQueryData<Brand[]>(QUERY_KEYS.brands);
      return brands?.find(brand => brand.id === id);
    },

    // Получить бренд по имени из кеша
    getBrandByName: (name: string): Brand | undefined => {
      const brands = queryClient.getQueryData<Brand[]>(QUERY_KEYS.brands);
      return brands?.find(brand => brand.name.toLowerCase() === name.toLowerCase());
    },

    // Предзагрузить бренды
    prefetchBrands: () => {
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.brands,
        queryFn: async () => {
          const { data, error } = await supabase
            .from("brands")
            .select("*")
            .order("name", { ascending: true });
          
          if (error) throw error;
          return data || [];
        },
      });
    },

    // Инвалидировать кеш брендов
    invalidateBrands: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands });
    },

    // Очистить кеш брендов
    clearBrandsCache: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.brands });
    },
  };
};

// Комбинированный хук для удобства (аналог оригинального useBrands)
export const useBrandsWithMutations = () => {
  const brandsQuery = useBrands();
  const addBrandMutation = useAddBrand();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteBrand();
  const utils = useBrandUtils();

  return {
    // Данные и состояние
    brands: brandsQuery.data || [],
    loading: brandsQuery.isLoading,
    error: brandsQuery.error,
    
    // Мутации
    addBrand: addBrandMutation.mutateAsync,
    updateBrand: (id: number, formData: Partial<BrandFormData>) => 
      updateBrandMutation.mutateAsync({ id, formData }),
    deleteBrand: deleteBrandMutation.mutateAsync,
    
    // Состояние мутаций
    isAdding: addBrandMutation.isPending,
    isUpdating: updateBrandMutation.isPending,
    isDeleting: deleteBrandMutation.isPending,
    
    // Утилиты
    getBrandById: utils.getBrandById,
    getBrandByName: utils.getBrandByName,
    
    // Рефетч
    refetch: brandsQuery.refetch,
  };
};