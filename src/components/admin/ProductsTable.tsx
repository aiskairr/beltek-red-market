import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit, Trash, Image as ImageIcon, X } from "lucide-react";
import { Category } from '@/hooks/useCategories';
import { Brand } from '@/hooks/useBrands';

// Определяем интерфейс Product (замените на ваш существующий)
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
    brand: string;
  category_id?: number;
  created_at?: string;
}

interface ProductsTableProps {
    categories: Category[];
       brands: Brand[]
  products: Product[];
  onDelete: (id: number) => void;
  onEdit?: (id: number, formData: Product) => void;
  loading?: boolean;
}

export const ProductsTable = ({ products, onDelete, onEdit, categories, brands, loading = false }: ProductsTableProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    brand: '',
    category: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image || '',
      brand: product.brand,
      category: product.category,
    });
    setImagePreview(product.image || '');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', image: '', brand: '', category: '' });
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && onEdit) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        image: formData.image ,
        brand: formData.brand,
        category: formData.category,
      };
      onEdit(editingProduct.id, updatedProduct);
      handleModalClose();
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KGS',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-belek-red mx-auto"></div>
          <p className="mt-2 text-gray-500">Загрузка товаров...</p>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">Товары не найдены</p>
          <p className="text-sm text-gray-400">Добавьте первый товар выше</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Изображение</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="max-w-xs">
                    {product.description ? (
                      <div className="truncate" title={product.description}>
                        {product.description}
                      </div>
                    ) : (
                      <span className="text-gray-400">Без описания</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell>
                    {product.created_at 
                      ? new Date(product.created_at).toLocaleDateString('ru-RU')
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onEdit && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:border-red-300"
                        onClick={() => {
                          if (confirm(`Вы уверены, что хотите удалить товар "${product.name}"?`)) {
                            onDelete(product.id);
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

      {/* Модальное окно редактирования */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать товар</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product-name">Название товара</Label>
              <Input
                id="product-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название товара"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Описание товара</Label>
              <Textarea
                id="product-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Введите описание товара (необязательно)"
                rows={4}
                className="resize-none"
              />
            </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-category">Категория</Label>
                <Select 
                  
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aw">Без категории</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.category.toString()}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-brand">Бренд</Label>
                <Select 
                   
                  onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите бренд" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aw">Без бренда</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.name.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Цена (сом)</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Введите цену товара"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Изображение товара</Label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Предпросмотр"
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Изображение не выбрано</p>
                </div>
              )}
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="bg-belek-red hover:bg-belek-red/90"
              >
                Сохранить изменения
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};