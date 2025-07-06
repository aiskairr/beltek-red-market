// components/admin/ProductsTab.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ProductForm } from './ProductForm';
import { ProductsTable } from './ProductsTable';
import { useProducts, useAddProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProduct';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { ProductFilters } from '@/hooks/useProduct';

export const ProductsTab: React.FC = () => {
    // Состояния для фильтрации и пагинации
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

    // Загружаем справочные данные
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: brands = [], isLoading: brandsLoading } = useBrands();

    // Создаем фильтры для продуктов
    const productFilters: ProductFilters = useMemo(() => {
        const filters: ProductFilters = {};
        
        if (searchTerm.trim()) {
            filters.searchTerm = searchTerm.trim();
        }
        
        if (selectedCategory && selectedCategory !== "__all__") {
            filters.category = selectedCategory;
        }
        
        return filters;
    }, [searchTerm, selectedCategory]);

    // Загружаем продукты с фильтрами и пагинацией
    const {
        data: productsData,
        isLoading: productsLoading,
        error: productsError,
        refetch
    } = useProducts(productFilters, pageSize, currentPage);

    // Мутации для продуктов
    const addProductMutation = useAddProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();

    // Извлекаем данные из ответа
    const products = productsData?.products || [];
    const totalCount = productsData?.totalCount || 0;
    const totalPages = productsData?.totalPages || 0;
    const hasMore = productsData?.hasMore || false;

    // Общее состояние загрузки
    const loading = productsLoading || categoriesLoading || brandsLoading;

    // Дебаунс для поиска
    const debouncedSearch = useCallback((term: string) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            setSearchTerm(term);
            setCurrentPage(1); // Сбрасываем на первую страницу при поиске
        }, 500);

        setSearchTimeout(timeout);
    }, [searchTimeout]);

    // Обработчики
    const handleSearchChange = (value: string) => {
        debouncedSearch(value);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setCurrentPage(1); // Сбрасываем на первую страницу при смене категории
    };

    const handlePageSizeChange = (newPageSize: string) => {
        setPageSize(parseInt(newPageSize));
        setCurrentPage(1); // Сбрасываем на первую страницу при смене размера
    };

    const handleAddProduct = async (productData: any) => {
        try {
            await addProductMutation.mutateAsync(productData);
            setIsAdding(false);
        } catch (error) {
            console.error('Ошибка добавления товара:', error);
        }
    };

    const handleEditProduct = async (id: number, formData: any) => {
        try {
            await updateProductMutation.mutateAsync({ id, formData });
        } catch (error) {
            console.error('Ошибка обновления товара:', error);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            await deleteProductMutation.mutateAsync(id);
        } catch (error) {
            console.error('Ошибка удаления товара:', error);
        }
    };

    // Навигация по страницам
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Генерация номеров страниц для отображения
    const getPageNumbers = () => {
        const delta = 2;
        const pages: (number | string)[] = [];
        const start = Math.max(1, currentPage - delta);
        const end = Math.min(totalPages, currentPage + delta);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push('...');
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    // Очистка таймера при размонтировании
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Обработка ошибок
    if (productsError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 mb-2">⚠️ Произошла ошибка при загрузке товаров</div>
                <div className="text-gray-700">{(productsError as Error).message}</div>
                <Button
                    onClick={() => refetch()}
                    className="mt-4"
                    variant="outline"
                >
                    Попробовать снова
                </Button>
            </div>
        );
    }

    return (
        <>
            {/* Панель управления */}
            <div className="space-y-4 mb-6">
                {/* Поиск и фильтры */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                        {/* Поиск */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск товаров..."
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        {/* Фильтр по категории */}
                        <Select value={selectedCategory || "__all__"} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Все категории" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Все категории</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.category}>
                                        {category.category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Кнопка добавления */}
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-belek-red hover:bg-red-700 w-full sm:w-auto"
                        disabled={addProductMutation.isPending}
                    >
                        {addProductMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Добавить товар
                    </Button>
                </div>

                {/* Информация и настройки */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>
                            Показано {products.length} из {totalCount} товаров
                        </span>
                        {loading && (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Загрузка...</span>
                            </div>
                        )}
                    </div>

                    {/* Выбор количества на странице */}
                    <div className="flex items-center gap-2">
                        <span>Показывать:</span>
                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span>на странице</span>
                    </div>
                </div>
            </div>

            {/* Форма добавления товара */}
            {isAdding && (
                <div className="mb-6">
                    <ProductForm
                        brands={brands}
                        categories={categories}
                        onSubmit={handleAddProduct}
                        onCancel={() => setIsAdding(false)}
                        loading={addProductMutation.isPending}
                    />
                </div>
            )}

            {/* Таблица товаров */}
            <div className="mb-6">
                <ProductsTable
                    products={products}
                    onDelete={handleDeleteProduct}
                    onEdit={handleEditProduct}
                    brands={brands}
                    categories={categories}
                    loading={loading}
                    updateLoading={updateProductMutation.isPending}
                    deleteLoading={deleteProductMutation.isPending}
                />
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* Навигация по страницам */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {getPageNumbers().map((page, index) => (
                            <Button
                                key={index}
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => typeof page === 'number' && handlePageClick(page)}
                                disabled={typeof page === 'string' || loading}
                                className="min-w-10"
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || loading}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Информация о страницах */}
                    <div className="text-sm text-muted-foreground">
                        Страница {currentPage} из {totalPages}
                    </div>
                </div>
            )}

            {/* Состояние пустого списка */}
            {products.length === 0 && !loading && (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h8a2 2 0 012 2v4.01"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm || selectedCategory !== "__all__" 
                            ? "Попробуйте изменить параметры поиска"
                            : "Добавьте первый товар в каталог"
                        }
                    </p>
                    {(searchTerm || selectedCategory !== "__all__") && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("");
                                setCurrentPage(1);
                            }}
                        >
                            Сбросить фильтры
                        </Button>
                    )}
                </div>
            )}
        </>
    );
};