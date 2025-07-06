// Вариант 1: Измените ваш Layout для работы с React Router
import { Header } from './Header';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';
import { useCategoriesWithMutations } from '@/hooks/useCategories';
import { FullPageLoader } from './Preloader';

export const Layout: React.FC = () => {
    const { categories: categoriesData, loading: CategoriesLoading } = useCategoriesWithMutations();
    // if (CategoriesLoading) {
    //     return (
    //       <FullPageLoader />
    //     )
    //   }
  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categoriesData} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer categories={categoriesData} />
    </div>
  );
};

export default Layout;