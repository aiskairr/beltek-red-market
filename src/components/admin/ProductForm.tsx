import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Category } from '../../hooks/useCategories';
import { Brand } from "@/hooks/useBrands";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X, ImageIcon } from "lucide-react";

interface ProductFormProps {
    categories: Category[];
    brands: Brand[]
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

interface Characteristic {
    name: string;
    value: string;
}

interface ProductImage {
    file: File;
    preview: string;
}

interface ProductFormData {
    name: string;
    price: string;
    category: string;
    mini_category: string;
    description: string;
    brand: string;
    characteristics: Characteristic[];
}

export const ProductForm: React.FC<ProductFormProps> = ({ categories, brands, onSubmit, onCancel }) => {
    const { toast } = useToast();
    const [images, setImages] = useState<ProductImage[]>([]);
    const [uploading, setUploading] = useState(false);
    
    const form = useForm<ProductFormData>({
        defaultValues: {
            name: "",
            price: "",
            brand: "",
            category: "",
            mini_category: "",
            description: "",
            characteristics: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "characteristics"
    });

    // Получаем выбранную категорию для фильтрации подкатегорий
    const selectedCategory = form.watch("category");
    
    // Получаем подкатегории для выбранной категории
    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        
        const category = categories.find(cat => cat.category === selectedCategory);
        return category?.mini_categories || [];
    }, [selectedCategory, categories]);

    // Обработка добавления изображений
    const handleImageAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImages: ProductImage[] = [];
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const preview = URL.createObjectURL(file);
                newImages.push({ file, preview });
            }
        });

        setImages(prev => [...prev, ...newImages]);
        // Очищаем input для повторного выбора файлов
        event.target.value = '';
    };

    // Удаление изображения
    const removeImage = (index: number) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview); // Освобождаем память
            updated.splice(index, 1);
            return updated;
        });
    };

    // Загрузка изображений в Supabase Storage
    const uploadImages = async (imageFiles: ProductImage[]): Promise<string[]> => {
        const uploadPromises = imageFiles.map(async ({ file }) => {
            const filePath = `products/${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
            
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from("products")
                .upload(filePath, file);

            if (uploadError) {
                throw new Error(`Ошибка загрузки ${file.name}: ${uploadError.message}`);
            }

            return supabase.storage
                .from("products")
                .getPublicUrl(filePath).data.publicUrl;
        });

        return Promise.all(uploadPromises);
    };

    const handleSubmit = async (data: ProductFormData) => {
        try {
            setUploading(true);
            const numericPrice = Number(data.price);
            let imageUrls: string[] = [];

            // Загружаем изображения если они есть
            if (images.length > 0) {
                try {
                    imageUrls = await uploadImages(images);
                } catch (error: any) {
                    toast({
                        title: "Ошибка загрузки изображений",
                        description: error.message,
                        variant: "destructive"
                    });
                    return;
                }
            }

            // Фильтруем пустые характеристики и приводим к правильному формату
            const filteredCharacteristics = data.characteristics
                .filter(char => char.name.trim() !== "" && char.value.trim() !== "")
                .map(char => ({
                    name: char.name.trim(),
                    value: char.value.trim()
                }));

            const productData = {
                name: data.name,
                category: data.category,
                mini_category: data.mini_category || null,
                brand: data.brand,
                description: data.description,
                price: numericPrice,
                images: imageUrls, // Массив URL изображений
                image: imageUrls[0] || "", // Основное изображение для обратной совместимости
                characteristics: filteredCharacteristics
            };

            console.log('Отправляемые данные:', productData);

            await onSubmit(productData);

            // Очищаем форму и изображения
            form.reset();
            images.forEach(img => URL.revokeObjectURL(img.preview));
            setImages([]);
        } catch (error: any) {
            console.error('Ошибка в handleSubmit:', error);
            toast({
                title: "Ошибка",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    // Сбрасываем подкатегорию при смене категории
    const handleCategoryChange = (value: string, field: any) => {
        field.onChange(value);
        form.setValue("mini_category", "");
    };

    const addCharacteristic = () => {
        append({ name: "", value: "" });
    };

    const removeCharacteristic = (index: number) => {
        remove(index);
    };

    // Очистка URL при размонтировании компонента
    useEffect(() => {
        return () => {
            images.forEach(img => URL.revokeObjectURL(img.preview));
        };
    }, []);

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Добавить новый товар</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                rules={{ required: "Название товара обязательно" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Название товара</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Введите название" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                rules={{
                                    required: "Цена обязательна",
                                    pattern: {
                                        value: /^\d+(\.\d+)?$/,
                                        message: "Введите корректную цену"
                                    }
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Цена</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                rules={{ required: "Выберите категорию" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Категория</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                onChange={(e) => handleCategoryChange(e.target.value, field)}
                                                className="w-full border px-3 py-2 rounded-md text-sm"
                                            >
                                                <option value="">Выберите категорию</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.category}>
                                                        {cat.category}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="mini_category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Подкатегория</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                disabled={!selectedCategory || availableSubcategories.length === 0}
                                                className="w-full border px-3 py-2 rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="">
                                                    {!selectedCategory 
                                                        ? "Сначала выберите категорию" 
                                                        : availableSubcategories.length === 0 
                                                        ? "Нет доступных подкатегорий"
                                                        : "Выберите подкатегорию (опционально)"
                                                    }
                                                </option>
                                                {availableSubcategories.map((subcategory, index) => (
                                                    <option key={index} value={subcategory}>
                                                        {subcategory}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brand"
                                rules={{ required: "Выберите бренд" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Бренд</FormLabel>
                                        <FormControl>
                                            <select
                                                {...field}
                                                className="w-full border px-3 py-2 rounded-md text-sm"
                                            >
                                                <option value="">Выберите Бренд</option>
                                                {brands.map((el) => (
                                                    <option key={el.id} value={el.name}>
                                                        {el.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Описание</FormLabel>
                                        <FormControl>
                                            <textarea
                                                {...field}
                                                className="w-full border rounded px-3 py-2"
                                                rows={4}
                                                placeholder="Описание товара"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Изображения */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-base font-medium">
                                    Изображения товара (опционально)
                                </FormLabel>
                                <Button
                                    type="button"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                    size="sm"
                                    disabled={uploading}
                                >
                                    <ImageIcon size={16} />
                                    Добавить изображения
                                </Button>
                            </div>

                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageAdd}
                                className="hidden"
                            />

                            {images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4 border rounded-lg bg-gray-50">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                                    Главное
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {images.length === 0 && (
                                <div className="text-center p-8 border rounded-lg bg-gray-50 text-gray-500">
                                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>Изображения не добавлены</p>
                                    <p className="text-sm">Нажмите "Добавить изображения" чтобы загрузить</p>
                                </div>
                            )}
                        </div>

                        {/* Характеристики */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-base font-medium">
                                    Характеристики (опционально)
                                </FormLabel>
                                <Button
                                    type="button"
                                    onClick={addCharacteristic}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                    size="sm"
                                >
                                    <Plus size={16} />
                                    Добавить характеристику
                                </Button>
                            </div>

                            {fields.length > 0 && (
                                <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                                            <div className="md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`characteristics.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm">Название</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="Например: Объем, Мощность..." 
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`characteristics.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm">Значение</FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="Например: 300л, 1200Вт..." 
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeCharacteristic(index)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {fields.length === 0 && (
                                <div className="text-center p-8 border rounded-lg bg-gray-50 text-gray-500">
                                    <p>Характеристики не добавлены</p>
                                    <p className="text-sm">Нажмите "Добавить характеристику" чтобы добавить</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" onClick={onCancel} disabled={uploading}>
                                Отмена
                            </Button>
                            <Button 
                                type="submit" 
                                className="bg-belek-red hover:bg-red-700"
                                disabled={uploading}
                            >
                                {uploading ? "Загрузка..." : "Добавить товар"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};