import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Category } from '../../hooks/useCategories';
import { Brand } from "@/hooks/useBrands";
import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

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

interface ProductFormData {
    name: string;
    price: string;
    category: string;
    mini_category: string;
    description: string;
    image: File | null;
    brand: string;
    characteristics: Characteristic[];
}

export const ProductForm: React.FC<ProductFormProps> = ({ categories, brands, onSubmit, onCancel }) => {
    const { toast } = useToast();
    const form = useForm<ProductFormData>({
        defaultValues: {
            name: "",
            price: "",
            brand: "",
            category: "",
            mini_category: "",
            description: "",
            image: null,
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

    const handleSubmit = async (data: ProductFormData) => {
        try {
            const numericPrice = Number(data.price);
            let imageUrl = "";

            if (data.image) {
                const file = data.image;
                const filePath = `products/${Date.now()}_${file.name}`;

                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from("products")
                    .upload(filePath, file);

                if (uploadError) {
                    toast({
                        title: "Ошибка загрузки",
                        description: uploadError.message,
                        variant: "destructive"
                    });
                    return;
                }

                imageUrl = supabase.storage
                    .from("products")
                    .getPublicUrl(filePath).data.publicUrl;
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
                image: imageUrl,
                characteristics: filteredCharacteristics // Передаем как массив объектов
            };

            console.log('Отправляемые данные:', productData); // Для отладки

            await onSubmit(productData);

            form.reset();
        } catch (error: any) {
            console.error('Ошибка в handleSubmit:', error); // Для отладки
            toast({
                title: "Ошибка",
                description: error.message,
                variant: "destructive"
            });
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
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Изображение</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                                            />
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
                            <Button type="button" onClick={onCancel}>
                                Отмена
                            </Button>
                            <Button type="submit" className="bg-belek-red hover:bg-red-700">
                                Добавить товар
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};