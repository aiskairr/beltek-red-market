import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Product } from '@/hooks/useProduct';
import { Edit, Trash } from "lucide-react";

interface ProductsTableProps {
    products: Product[];
    onDelete: (id: number) => void;
    onEdit?: (product: Product) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({ products, onDelete, onEdit }) => {
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Название</TableHead>
                            <TableHead>Категория</TableHead>
                            <TableHead>Цена</TableHead>
                            <TableHead>На складе</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.price.toLocaleString()} с</TableCell>
                                <TableCell>{product.stock || 0}</TableCell>
                                <TableCell>{product.featured ? "Да" : "Нет"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        {onEdit && (
                                            <Button
                                                onClick={() => onEdit(product)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            className="text-red-500"
                                            onClick={() => onDelete(product.id)}
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
