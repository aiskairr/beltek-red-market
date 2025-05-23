
import React, { useEffect, useState } from 'react';
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Search, Plus, Edit, Trash, Package, Users, ShoppingCart, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [productsData, setProductsData] = useState<any[]>([]);
  const { toast } = useToast();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  //catedoyty supabase
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ category: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*").order("category", { ascending: true });
      if (!error) setCategories(data || []);
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        toast({ title: "Ошибка загрузки", description: error.message });
      } else {
        setProductsData(data || []);
      }
    };
    fetchProducts();
  }, []);

  const form = useForm({
    defaultValues: {
      name: "",
      price: "",
      category: "",
      description: "",
      image: null as File | null
    }
  });

const deleteItem = async (id: string | number, type: "товар" | "категория") => {
  if (type === "товар") {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар.",
        variant: "destructive",
      });
    } else {
      setProductsData((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Товар удалён",
        description: `Товар с ID ${id} был удалён.`,
      });
    }
  }

  if (type === "категория") {
    // Получаем имя категории по ID
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("category")
      .eq("id", id)
      .single();

    if (categoryError || !categoryData) {
      toast({
        title: "Ошибка",
        description: "Не удалось найти категорию для удаления.",
        variant: "destructive",
      });
      return;
    }

    const categoryName = categoryData.category;

    // Удаляем связанные товары
    const { error: productsError } = await supabase
      .from("products")
      .delete()
      .eq("category", categoryName);

    if (productsError) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить связанные товары.",
        variant: "destructive",
      });
      return;
    }

    // Удаляем саму категорию
    const { error: categoryDeleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (categoryDeleteError) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить категорию.",
        variant: "destructive",
      });
    } else {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast({
        title: "Категория удалена",
        description: `Категория и все её товары удалены.`,
      });
    }
  }
};




  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = productsData.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAddForm = () => {
    setIsAdding(!isAdding);
  };

  const onSubmit = async (data: any) => {
    const numericPrice = Number(data.price);
    const { data: userData } = await supabase.auth.getUser();
    console.log("Текущий пользователь:", userData?.user);

    let imageUrl = "";

    if (data.image) {
      const file = data.image as File;
      const filePath = `products/${Date.now()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: "Ошибка загрузки", description: uploadError.message });
        return;
      }

      imageUrl = supabase.storage
        .from("products")
        .getPublicUrl(filePath).data.publicUrl;
    }

    const { data: newProduct, error } = await supabase.from("products").insert({
      name: data.name,
      category: data.category,
      description: data.description,
      price: numericPrice,
      image: imageUrl,
    }).select().single();

    if (error) {
      toast({ title: "Ошибка добавления", description: error.message });
      return;
    }

    setProductsData([newProduct, ...productsData]);

    toast({
      title: "Товар добавлен",
      description: `${data.name} успешно добавлен`,
    });

    setIsAdding(false);
    form.reset();
  };


  const deleteItem2 = async (id: number, type: string) => {
    if (type === "товар") {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        setProductsData(productsData.filter(product => product.id !== id));
      } else {
        toast({ title: "Ошибка удаления", description: error.message });
        return;
      }
    }

    toast({
      title: "Элемент удален",
      description: `${type} с ID ${id} был удален`,
    });
  };

  const renderProductsTab = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск товаров..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
        <Button onClick={toggleAddForm} className="bg-belek-red hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" /> Добавить товар
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Добавить новый товар</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
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

                  {/* <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Количество на складе</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  /> */}
                  {/* <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Популярный товар</FormLabel>
                      </FormItem>
                    )}
                  /> */}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={toggleAddForm}>Отмена</Button>
                  <Button type="submit" className="bg-belek-red hover:bg-red-700">Добавить товар</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

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
                <TableHead>Популярный</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price.toLocaleString()} с</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.featured ? "Да" : "Нет"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500"
                        onClick={() => deleteItem(product.id, "товар")}
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
    </>
  );

  // const renderOrdersTab = () => (
  //   <Card>
  //     <CardContent className="p-0">
  //       <Table>
  //         <TableHeader>
  //           <TableRow>
  //             <TableHead>ID</TableHead>
  //             <TableHead>Покупатель</TableHead>
  //             <TableHead>Дата</TableHead>
  //             <TableHead>Статус</TableHead>
  //             <TableHead>Сумма</TableHead>
  //             <TableHead className="text-right">Действия</TableHead>
  //           </TableRow>
  //         </TableHeader>
  //         <TableBody>
  //           {ordersData.map((order) => (
  //             <TableRow key={order.id}>
  //               <TableCell>{order.id}</TableCell>
  //               <TableCell>{order.customer}</TableCell>
  //               <TableCell>{order.date}</TableCell>
  //               <TableCell>{order.status}</TableCell>
  //               <TableCell>{order.total.toLocaleString()} с</TableCell>
  //               <TableCell className="text-right">
  //                 <div className="flex justify-end space-x-2">
  //                   <Button size="sm" variant="outline">
  //                     <Edit className="h-4 w-4" />
  //                   </Button>
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     className="text-red-500"
  //                     onClick={() => deleteItem(order.id, "заказ")}
  //                   >
  //                     <Trash className="h-4 w-4" />
  //                   </Button>
  //                 </div>
  //               </TableCell>
  //             </TableRow>
  //           ))}
  //         </TableBody>
  //       </Table>
  //     </CardContent>
  //   </Card>
  // );

  // const renderUsersTab = () => (
  //   <Card>
  //     <CardContent className="p-0">
  //       <Table>
  //         <TableHeader>
  //           <TableRow>
  //             <TableHead>ID</TableHead>
  //             <TableHead>Имя</TableHead>
  //             <TableHead>Email</TableHead>
  //             <TableHead>Заказы</TableHead>
  //             <TableHead>Дата регистрации</TableHead>
  //             <TableHead className="text-right">Действия</TableHead>
  //           </TableRow>
  //         </TableHeader>
  //         <TableBody>
  //           {usersData.map((user) => (
  //             <TableRow key={user.id}>
  //               <TableCell>{user.id}</TableCell>
  //               <TableCell>{user.name}</TableCell>
  //               <TableCell>{user.email}</TableCell>
  //               <TableCell>{user.orders}</TableCell>
  //               <TableCell>{user.registeredDate}</TableCell>
  //               <TableCell className="text-right">
  //                 <div className="flex justify-end space-x-2">
  //                   <Button size="sm" variant="outline">
  //                     <Edit className="h-4 w-4" />
  //                   </Button>
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     className="text-red-500"
  //                     onClick={() => deleteItem(user.id, "пользователь")}
  //                   >
  //                     <Trash className="h-4 w-4" />
  //                   </Button>
  //                 </div>
  //               </TableCell>
  //             </TableRow>
  //           ))}
  //         </TableBody>
  //       </Table>
  //     </CardContent>
  //   </Card>
  // );

  const renderCategoriesTab = () => (
    <Card>
      <Card className="mb-4 p-4">
        <h3 className="text-lg font-semibold mb-2">Добавить категорию</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            placeholder="Название категории"
            value={newCategory.category}
            onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
          />
          <Button
            className="bg-belek-red hover:bg-red-700"
            onClick={async () => {
              if (!newCategory.category) return;

              const { error } = await supabase.from("categories").insert([newCategory]);

              if (!error) {
                setNewCategory({ category: "" });
                const { data } = await supabase.from("categories").select("*").order("category");
                setCategories(data || []);
              }
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить категорию
          </Button>
        </div>
      </Card>

      <CardContent className="p-0">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Количество товаров</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.category}</TableCell>
                {/* <TableCell>{category.slug}</TableCell>
                <TableCell>{category.productsCount}</TableCell> */}
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
  size="sm"
  variant="outline"
  className="text-red-500"
  onClick={() => deleteItem(category.id, "категория")}
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    });
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-belek-black mb-8">Панель администратора</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 shadow-md"
        >
          Выйти
        </button>


        <Tabs defaultValue="products" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="products" className="flex items-center">
              <Package className="h-4 w-4 mr-2" /> Товары
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" /> Заказы
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" /> Пользователи
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Категории
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {renderProductsTab()}
          </TabsContent>

          {/* <TabsContent value="orders">
            {renderOrdersTab()}
          </TabsContent>

          <TabsContent value="users">
            {renderUsersTab()}
          </TabsContent> */}

          <TabsContent value="categories">
            {renderCategoriesTab()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
