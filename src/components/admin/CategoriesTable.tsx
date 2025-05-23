// components/admin/CategoriesTable.tsx (обновленная версия)
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Image as ImageIcon } from "lucide-react";
import { Category } from '../../hooks/useCategories';

interface CategoriesTableProps {
  categories: Category[];
  onDelete: (id: number) => void;
  onEdit?: (category: Category) => void;
  loading?: boolean;
}

export const CategoriesTable = ({ categories, onDelete, onEdit, loading = false }: CategoriesTableProps) => {
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

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Категории не найдены</p>
          <p className="text-sm text-gray-400">Добавьте первую категорию выше</p>
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
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.id}</TableCell>
                <TableCell>
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.category}
                      className="h-12 w-12 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.category}</TableCell>
                <TableCell>
                  {category.created_at 
                    ? new Date(category.created_at).toLocaleDateString('ru-RU')
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {onEdit && (
                      <Button 
                        onClick={() => onEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (confirm(`Вы уверены, что хотите удалить категорию "${category.category}"? Это также удалит все товары в этой категории.`)) {
                          onDelete(category.id);
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