
import React, { useState } from 'react';
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

// Примерные данные для админ-панели
const productsData = [
  { id: 1, name: "Холодильник LG GA-B459CLWL", category: "refrigerators", price: 42999, stock: 12, featured: true },
  { id: 2, name: "Стиральная машина Samsung WW60H2230EW", category: "washing-machines", price: 28999, stock: 8, featured: false },
  { id: 3, name: "Телевизор LG 43LM5772PLA", category: "tvs", price: 24999, stock: 15, featured: true },
  { id: 4, name: "Микроволновая печь Midea MM720CKE", category: "kitchen", price: 5999, stock: 20, featured: false },
];

const ordersData = [
  { id: 1001, customer: "Азамат Касымов", date: "2023-05-20", status: "Доставлен", total: 42999 },
  { id: 1002, customer: "Елена Иванова", date: "2023-05-21", status: "В обработке", total: 28999 },
  { id: 1003, customer: "Мирлан Джумабаев", date: "2023-05-22", status: "Отправлен", total: 24999 },
];

const usersData = [
  { id: 1, name: "Азамат Касымов", email: "azamat@example.com", orders: 3, registeredDate: "2023-01-10" },
  { id: 2, name: "Елена Иванова", email: "elena@example.com", orders: 2, registeredDate: "2023-02-15" },
  { id: 3, name: "Мирлан Джумабаев", email: "mirlan@example.com", orders: 5, registeredDate: "2023-03-20" },
];

const categoriesData = [
  { id: 1, name: "Холодильники", slug: "refrigerators", productsCount: 25 },
  { id: 2, name: "Стиральные машины", slug: "washing-machines", productsCount: 18 },
  { id: 3, name: "Телевизоры", slug: "tvs", productsCount: 30 },
  { id: 4, name: "Кухонная техника", slug: "kitchen", productsCount: 40 },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: "",
      price: "",
      category: "",
      stock: "",
      featured: false
    }
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredProducts = productsData.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAddForm = () => {
    setIsAdding(!isAdding);
  };

  const onSubmit = (data: any) => {
    // Здесь будет логика добавления продукта
    console.log(data);
    toast({
      title: "Товар добавлен",
      description: `${data.name} успешно добавлен в каталог`,
    });
    setIsAdding(false);
    form.reset();
  };

  const deleteItem = (id: number, type: string) => {
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
                          <Input placeholder="Название товара" {...field} />
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
                          <Input placeholder="Категория" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
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
                  />
                  <FormField
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
                  />
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

  const renderOrdersTab = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Покупатель</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersData.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{order.total.toLocaleString()} с</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500"
                      onClick={() => deleteItem(order.id, "заказ")}
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

  const renderUsersTab = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Заказы</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.orders}</TableCell>
                <TableCell>{user.registeredDate}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500"
                      onClick={() => deleteItem(user.id, "пользователь")}
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

  const renderCategoriesTab = () => (
    <Card>
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
            {categoriesData.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.productsCount}</TableCell>
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-belek-black mb-8">Панель администратора</h1>
        
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
          
          <TabsContent value="orders">
            {renderOrdersTab()}
          </TabsContent>
          
          <TabsContent value="users">
            {renderUsersTab()}
          </TabsContent>
          
          <TabsContent value="categories">
            {renderCategoriesTab()}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
