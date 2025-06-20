// hooks/useProducts.ts (оптимизированная версия с пагинацией)
import { useState, useEffect, useCallback } from 'react';
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
  images?: string[];
  characteristics?: Characteristic[];
  created_at: string;
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasMore: boolean;
}

const DEFAULT_PAGE_SIZE = 50;

export const useProducts = (initialPageSize: number = DEFAULT_PAGE_SIZE) => {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: true,
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    pageSize: initialPageSize,
    hasMore: false
  });
  
  const { toast } = useToast();

  // Загрузка товаров с пагинацией
  const fetchProducts = useCallback(async (
    page: number = 1, 
    pageSize: number = state.pageSize,
    searchTerm: string = '',
    category: string = '',
    append: boolean = false
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Добавляем фильтры
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`);
      }
      
      if (category) {
        query = query.eq('category', category);
      }

      // Пагинация
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Обрабатываем данные
      const parsedProducts = (data || []).map(product => ({
        ...product,
        characteristics: product.characteristics || [],
        images: product.images || [],
        image: product.image || (product.images && product.images.length > 0 ? product.images[0] : '')
      }));

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasMore = page < totalPages;

      setState(prev => ({
        ...prev,
        products: append ? [...prev.products, ...parsedProducts] : parsedProducts,
        currentPage: page,
        totalPages,
        totalCount,
        pageSize,
        hasMore,
        loading: false
      }));

      return {
        products: parsedProducts,
        totalCount,
        totalPages,
        hasMore
      };

    } catch (error: any) {
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [state.pageSize, toast]);

  // Загрузка следующей страницы (для infinite scroll)
  const loadMore = useCallback(async (searchTerm?: string, category?: string) => {
    if (state.loading || !state.hasMore) return;
    
    await fetchProducts(
      state.currentPage + 1, 
      state.pageSize, 
      searchTerm, 
      category, 
      true // append = true
    );
  }, [state.currentPage, state.pageSize, state.loading, state.hasMore, fetchProducts]);

  // Переход на конкретную страницу
  const goToPage = useCallback(async (page: number, searchTerm?: string, category?: string) => {
    if (page < 1 || page > state.totalPages || state.loading) return;
    
    await fetchProducts(page, state.pageSize, searchTerm, category, false);
  }, [state.totalPages, state.pageSize, state.loading, fetchProducts]);

  // Поиск с пагинацией
  const searchProducts = useCallback(async (searchTerm: string, category?: string) => {
    await fetchProducts(1, state.pageSize, searchTerm, category, false);
  }, [state.pageSize, fetchProducts]);

  // Изменение размера страницы
  const changePageSize = useCallback(async (newPageSize: number, searchTerm?: string, category?: string) => {
    setState(prev => ({ ...prev, pageSize: newPageSize }));
    await fetchProducts(1, newPageSize, searchTerm, category, false);
  }, [fetchProducts]);

  const uploadProductImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
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

      let imageUrls: string[] = [];
      let mainImageUrl = "";

      if (formData.images && Array.isArray(formData.images)) {
        imageUrls = formData.images;
        mainImageUrl = imageUrls[0] || "";
      } else if (formData.image) {
        if (formData.image instanceof File) {
          mainImageUrl = await uploadProductImage(formData.image);
          imageUrls = [mainImageUrl];
        } else {
          mainImageUrl = formData.image;
          imageUrls = [mainImageUrl];
        }
      }

      const updateData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        image: mainImageUrl,
        images: imageUrls,
        brand: formData.brand,
        category: formData.category,
        mini_category: formData.mini_category || null,
        characteristics: formData.characteristics || []
      };

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Обновляем товар в текущем списке
      setState(prev => ({
        ...prev,
        products: prev.products.map(prod => prod.id === id ? data : prod)
      }));

      toast({
        title: "Товар обновлён",
        description: `Товар "${formData.name}" успешно обновлён`,
      });

      return data;
    } catch (error: any) {
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
      const insertData = {
        name: productData.name,
        category: productData.category,
        mini_category: productData.mini_category || null,
        brand: productData.brand,
        description: productData.description,
        price: productData.price,
        image: productData.image || "",
        images: productData.images || [],
        templates: productData.templates || []
      };

      const { data, error } = await supabase
        .from("products")
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // Добавляем товар в начало списка и обновляем счетчики
      setState(prev => ({
        ...prev,
        products: [data, ...prev.products.slice(0, prev.pageSize - 1)], // Убираем последний если превышаем лимит
        totalCount: prev.totalCount + 1,
        totalPages: Math.ceil((prev.totalCount + 1) / prev.pageSize)
      }));

      toast({
        title: "Товар добавлен",
        description: `${productData.name} успешно добавлен`,
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

  const deleteProduct = async (id: number) => {
    try {
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

      // Удаляем изображения из storage
      if (productToDelete?.images && Array.isArray(productToDelete.images)) {
        const deletePromises = productToDelete.images.map(async (imageUrl: string) => {
          try {
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

      // Обновляем состояние
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id),
        totalCount: prev.totalCount - 1,
        totalPages: Math.ceil(Math.max(0, prev.totalCount - 1) / prev.pageSize)
      }));

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

  // Начальная загрузка
  useEffect(() => {
    fetchProducts(1);
  }, []);

  return {
    // Данные
    products: state.products,
    loading: state.loading,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    pageSize: state.pageSize,
    hasMore: state.hasMore,
    
    // Методы CRUD
    addProduct,
    deleteProduct,
    onEdit,
    
    // Методы пагинации
    fetchProducts,
    loadMore,
    goToPage,
    searchProducts,
    changePageSize,
    refetch: () => fetchProducts(state.currentPage)
  };
};