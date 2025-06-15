    // components/admin/ProductsTab.tsx
    import { useState } from 'react';
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Search, Plus } from "lucide-react";
    import { ProductForm } from './ProductForm';
    import { ProductsTable } from './ProductsTable';
    import { useProducts } from '@/hooks/useProduct';
    import { useCategories } from '../../hooks/useCategories';
    import { useBrands } from '@/hooks/useBrands';

    export const ProductsTab: React.FC = () => {
        const [searchTerm, setSearchTerm] = useState("");
        const [isAdding, setIsAdding] = useState(false);

        const { products, addProduct, deleteProduct, onEdit } = useProducts();
        const { categories } = useCategories();
        const { brands } = useBrands();

        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const handleAddProduct = async (productData: any) => {
            await addProduct(productData);
            setIsAdding(false);
        };

        return (
            <>
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск товаров..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-belek-red hover:bg-red-700"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Добавить товар
                    </Button>
                </div>

                {isAdding && (
                    <ProductForm
                        brands={brands}
                        categories={categories}
                        onSubmit={handleAddProduct}
                        onCancel={() => setIsAdding(false)}
                    />
                )}

                <ProductsTable
                    products={filteredProducts}
                    onDelete={deleteProduct}
                    onEdit={onEdit}
                    brands={brands}
                        categories={categories}
                />
            </>
        );
    };