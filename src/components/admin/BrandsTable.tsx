// components/admin/CategoriesTable.tsx (обновленная версия)
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Image as ImageIcon } from "lucide-react";
import { Category } from '../../hooks/useCategories';
import { Brand } from "@/hooks/useBrands";

interface BrandsTableProps {
    brands: Brand[];
    onDelete: (id: number) => void;
    onEdit?: (category: Brand) => void;
    loading?: boolean;
}

export const BrandsTable = ({ brands, onDelete, onEdit, loading = false }: BrandsTableProps) => {
    if (loading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-belek-red mx-auto"></div>
                    <p className="mt-2 text-gray-500">Загрузка категорий...</p>
                </CardContent>
            </Card>
        );
    }

    if (brands.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Бренды не найдены</p>
                    <p className="text-sm text-gray-400">Добавьте первый бренд выше</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Изображение</TableHead>
                            <TableHead>Название</TableHead>
                            <TableHead>Дата создания</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brands.map((brand) => (
                            <TableRow key={brand.id}>
                                <TableCell className="font-medium">{brand.id}</TableCell>
                                <TableCell>
                                    {brand.image ? (
                                        <img
                                            src={brand.image}
                                            alt={"Картинка"}
                                            className="h-12 w-12 object-cover rounded-lg border"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 bg-gray-100 rounded-lg border flex items-center justify-center">
                                            <ImageIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{brand.name}</TableCell>
                                <TableCell>
                                    {brand.created_at
                                        ? new Date(brand.created_at).toLocaleDateString('ru-RU')
                                        : '-'
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        {onEdit && (
                                            <Button
                                                onClick={() => onEdit(brand)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => {
                                                if (confirm(`Вы уверены, что хотите удалить категорию "${brand.name}"? Это также удалит все товары в этой категории.`)) {
                                                    onDelete(brand.id);
                                                }
                                            }}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};