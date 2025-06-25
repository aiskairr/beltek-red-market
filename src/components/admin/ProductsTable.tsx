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
import { Edit, Trash, Image as ImageIcon, X, Plus, Minus, Upload } from "lucide-react";
import { Category } from '@/hooks/useCategories';
import { Brand } from '@/hooks/useBrands';
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';

// Интерфейс для шаблонов (заменяет characteristics)
interface Template {
  template: string; // Исправлено: было name, должно быть template
  value: string;    // Исправлено: было template, должно быть value
}

// Обновленный интерфейс Product с templates
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  category: string;
  mini_category?: string;
  brand: string;
  templates?: Template[]; // Заменили characteristics на templates
  category_id?: number;
  created_at?: string;
  in_stock: boolean | null;
}

interface ProductsTableProps {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  onDelete: (id: number) => void;
  onEdit?: (id: number, formData: Product) => void;
  loading?: boolean;
  availableTemplates?: string[]; // Изменено: массив строк для названий шаблонов
}

export const ProductsTable = ({
  products,
  onDelete,
  onEdit,
  categories,
  brands,
  loading = false,
  availableTemplates = []
}: ProductsTableProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    mini_category: '',
    in_stock: false
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  // Получаем выбранную категорию и её мини-категории
  useEffect(() => {
    if (formData.category) {
      const category = categories.find(cat => cat.category === formData.category);
      setSelectedCategory(category || null);

      // Сбрасываем мини-категорию при смене основной категории
      if (category && formData.mini_category) {
        const hasMiniCategory = category.mini_categories?.includes(formData.mini_category);
        if (!hasMiniCategory) {
          setFormData(prev => ({ ...prev, mini_category: '' }));
        }
      }
    } else {
      setSelectedCategory(null);
      setFormData(prev => ({ ...prev, mini_category: '' }));
    }
  }, [formData.category, categories]);

  // Получаем доступные шаблоны для выбранной категории
  const categoryTemplates = selectedCategory?.templates || [];

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      brand: product.brand,
      category: product.category,
      mini_category: product.mini_category || '',
      in_stock: product.in_stock,
    });
    setTemplates(product.templates || []); // Используем templates вместо characteristics
    setImages(product.images || []);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', brand: '', category: '', mini_category: '', in_stock: false });
    setTemplates([]);
    setImages([]);
    setSelectedCategory(null);
  };

  // Обработка добавления изображений
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);

      // Ограничиваем количество изображений до 6
      const availableSlots = 6 - images.length;
      const filesToProcess = fileArray.slice(0, availableSlots);

      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Удаление изображения
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Перестановка изображений drag & drop
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex !== null && draggedImageIndex !== dropIndex) {
      const newImages = [...images];
      const draggedImage = newImages[draggedImageIndex];
      newImages.splice(draggedImageIndex, 1);
      newImages.splice(dropIndex, 0, draggedImage);
      setImages(newImages);
    }
    setDraggedImageIndex(null);
  };

  // Функции для работы с шаблонами
  const addTemplate = () => {
    setTemplates(prev => [...prev, { template: '', value: '' }]);
  };

  const removeTemplate = (index: number) => {
    setTemplates(prev => prev.filter((_, i) => i !== index));
  };

  // Исправленная функция обновления шаблона
  const updateTemplate = (index: number, field: 'template' | 'value', value: string) => {
    setTemplates(prev =>
      prev.map((template, i) =>
        i === index ? { ...template, [field]: value } : template
      )
    );
  };

  // Добавление готового шаблона
  const addPredefinedTemplate = (templateName: string) => {
    const exists = templates.some(t => t.template === templateName);
    if (!exists) {
      setTemplates(prev => [...prev, { template: templateName, value: '' }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && onEdit) {
      // Фильтруем пустые шаблоны
      const validTemplates = templates.filter(
        template => template.template.trim() !== '' && template.value.trim() !== ''
      );

      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        images: images,
        brand: formData.brand,
        category: formData.category,
        mini_category: formData.mini_category,
        templates: validTemplates, // Используем templates
        in_stock: formData.in_stock
      };
      console.log(updatedProduct)
      onEdit(editingProduct.id, updatedProduct);
      // handleModalClose();
    }
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
                <TableHead>Изображения</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Мини-категория</TableHead>
                <TableHead>Шаблоны</TableHead>
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
                    <div className="flex space-x-1">
                      {product.images && product.images.length > 0 ? (
                        <>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded-lg border"
                          />
                          {product.images.length > 1 && (
                            <div className="h-12 w-12 bg-gray-100 rounded-lg border flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{product.images.length - 1}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-lg border flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.mini_category ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {product.mini_category}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {product.templates && product.templates.length > 0 ? (
                      <div className="space-y-1">
                        {product.templates.slice(0, 2).map((template, index) => (
                          <div key={index} className="text-xs">
                            <span className="font-medium">{template.template}:</span> {template.value}
                          </div>
                        ))}
                        {product.templates.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{product.templates.length - 2} еще
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Нет шаблонов</span>
                    )}
                  </TableCell>
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="product-stock-select" className="text-sm font-medium">
                Статус наличия
              </Label>
              <select
                id="product-stock-select"
                onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.value === 'true' ? true : false }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={""}
              >
                <option value="" disabled>
                  Выберите статус
                </option>
                <option value="true">✅ В наличии</option>
                <option value="false">❌ Нет в наличии</option>
              </select>
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
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без категории</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.category}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-mini-category">Мини-категория</Label>
                <Select
                  value={formData.mini_category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mini_category: value }))}
                  disabled={!selectedCategory || !selectedCategory.mini_categories?.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedCategory
                        ? "Сначала выберите категорию"
                        : !selectedCategory.mini_categories?.length
                          ? "Нет мини-категорий"
                          : "Выберите мини-категорию"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без мини-категории</SelectItem>
                    {selectedCategory?.mini_categories?.map((miniCat, index) => (
                      <SelectItem key={index} value={miniCat}>
                        {miniCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-brand">Бренд</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите бренд" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без бренда</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Секция шаблонов */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Шаблоны товара</Label>
                <div className="flex gap-2">
                  {categoryTemplates.length > 0 && (
                    <Select onValueChange={(value) => {
                      if (value) addPredefinedTemplate(value);
                    }}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Выбрать готовый шаблон" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryTemplates.map((template, index) => (
                          <SelectItem key={index} value={template}>
                            {template}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTemplate}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить шаблон
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Шаблоны не добавлены</p>
                    <p className="text-sm">Нажмите "Добавить шаблон" выше или выберите готовый</p>
                  </div>
                ) : (
                  templates.map((template, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Select
                          value={template.template || ''}
                          onValueChange={(value) => updateTemplate(index, 'template', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите шаблон" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryTemplates.length > 0 ? (
                              categoryTemplates.map((temp, tempIndex) => (
                                <SelectItem key={tempIndex} value={temp}>
                                  {temp}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                Нет доступных шаблонов
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Значение шаблона"
                          value={template.value || ''}
                          onChange={(e) => updateTemplate(index, 'value', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTemplate(index)}
                        className="text-red-500 hover:text-red-700 hover:border-red-300"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Секция изображений */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Изображения товара (максимум 6)</Label>
                <div className="text-sm text-gray-500">
                  {images.length}/6 изображений
                </div>
              </div>

              {/* Загрузка изображений */}
              {images.length < 6 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label
                        htmlFor="image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-belek-red hover:bg-belek-red/90"
                      >
                        Выбрать изображения
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Можно выбрать несколько изображений одновременно
                    </p>
                  </div>
                </div>
              )}

              {/* Превью изображений */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="relative group cursor-move"
                    >
                      <img
                        src={image}
                        alt={`Изображение ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-belek-red text-white text-xs px-2 py-1 rounded">
                          Главное
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <p className="text-sm text-gray-500">
                  Перетащите изображения для изменения порядка. Первое изображение будет главным.
                </p>
              )}
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