// Admin.tsx (основной компонент)
import { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, ShoppingCart, Tag } from "lucide-react";
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { useAuth } from '@/hooks/useAuth';
import { BrandsTab } from '@/components/admin/BrandsTab';
import ExcelUploader from '@/components/admin/ExcelUploader';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState("products");
  const { loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-belek-red mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto py-8">
        <AdminHeader onLogout={logout} />

        <Tabs defaultValue="products" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="products" className="flex items-center">
              <Package className="h-4 w-4 mr-2" /> Товары
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" /> Бренды
            </TabsTrigger>
            {/* <TabsTrigger value="users" className="flex items-center">
              <Users className="h-4 w-4 mr-2" /> Пользователи
            </TabsTrigger> */}
            <TabsTrigger value="categories" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Категории
            </TabsTrigger>
            <TabsTrigger value="Excel" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Excel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="brands">
            <BrandsTab />
          </TabsContent>

          {/* <TabsContent value="users">
            <div className="text-center py-8">
              <p className="text-gray-500">Функционал пользователей будет добавлен позже</p>
            </div>
          </TabsContent> */}

          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="Excel">
            <ExcelUploader />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Admin;