// components/admin/ProductsTab.tsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ProductForm } from './ProductForm';
import { ProductsTable } from './ProductsTable';
import { useProducts } from '@/hooks/useProduct';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';

export const ProductsTab: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

    const {
        products,
        loading,
        currentPage,
        totalPages,
        totalCount,
        pageSize,
        hasMore,
        addProduct,
        deleteProduct,
        onEdit,
        goToPage,
        searchProducts,
        changePageSize,
        loadMore
    } = useProducts(50); // Загружаем по 50 товаров за раз

    const { categories } = useCategories();
    const { brands } = useBrands();

    // Дебаунс для поиска
    const debouncedSearch = useCallback((term: string, category: string) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            searchProducts(term, category);
        }, 500); // 500мс задержка

        setSearchTimeout(timeout);
    }, [searchProducts, searchTimeout]);

    // Обработка изменения поиска
    useEffect(() => {
        debouncedSearch(searchTerm, selectedCategory);

        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTerm, selectedCategory, debouncedSearch]);

    const handleAddProduct = async (productData: any) => {
        await addProduct(productData);
        setIsAdding(false);
    };

    const handlePageSizeChange = (newPageSize: string) => {
        changePageSize(parseInt(newPageSize), searchTerm, selectedCategory);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1, searchTerm, selectedCategory);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1, searchTerm, selectedCategory);
        }
    };

    const handlePageClick = (page: number) => {
        goToPage(page, searchTerm, selectedCategory);
    };

    // Генерация номеров страниц для отображения
    const getPageNumbers = () => {
        const delta = 2; // Количество страниц слева и справа от текущей
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
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        {/* Фильтр по категории */}
                       // В компоненте:
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                    >
                        <Plus className="mr-2 h-4 w-4" /> Добавить товар
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
                        <Select value={pageSize?.toString()} onValueChange={handlePageSizeChange}>
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
                    />
                </div>
            )}

            {/* Таблица товаров */}
            <div className="mb-6">
                <ProductsTable
                    products={products}
                    onDelete={deleteProduct}
                    onEdit={onEdit}
                    brands={brands}
                    categories={categories}
                    loading={loading}
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

            {/* Кнопка "Загрузить еще" для мобильных устройств */}
            {hasMore && (
                <div className="flex justify-center mt-6 sm:hidden">
                    <Button
                        variant="outline"
                        onClick={() => loadMore(searchTerm, selectedCategory)}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        Загрузить еще
                    </Button>
                </div>
            )}
        </>
    );
};