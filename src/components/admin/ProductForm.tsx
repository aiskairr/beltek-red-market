import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { Category } from '../../hooks/useCategories';
import { Brand } from "@/hooks/useBrands";

interface ProductFormProps {
    categories: Category[];
    brands: Brand[]
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

interface ProductFormData {
    name: string;
    price: string;
    category: string;
    description: string;
    image: File | null;
    brand: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ categories, brands, onSubmit, onCancel }) => {
    const { toast } = useToast();
    const form = useForm<ProductFormData>({
        defaultValues: {
            name: "",
            price: "",
            brand: "",
            category: "",
            description: "",
            image: null
        }
    });

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

            await onSubmit({
                name: data.name,
                category: data.category,
                brand: data.brand,
                description: data.description,
                price: numericPrice,
                image: imageUrl,
            });

            form.reset();
        } catch (error: any) {
            toast({
                title: "Ошибка",
                description: error.message,
                variant: "destructive"
            });
        }
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