
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useCart } from '@/hooks/use-cart';

const categories = [
  { name: 'Холодильники', path: '/category/refrigerators' },
  { name: 'Стиральные машины', path: '/category/washing-machines' },
  { name: 'Телевизоры', path: '/category/tvs' },
  { name: 'Кухонная техника', path: '/category/kitchen' },
  { name: 'Кондиционеры', path: '/category/air-conditioners' },
  { name: 'Пылесосы', path: '/category/vacuum-cleaners' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-belek-black text-white px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-sm hidden md:block">
            <span>Тел: +996 555 123 456</span>
            <span className="mx-4">|</span>
            <span>Email: info@belek-tech.kg</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/about" className="hover:text-belek-red transition-colors">О компании</Link>
            <Link to="/delivery" className="hover:text-belek-red transition-colors">Доставка</Link>
            <Link to="/contacts" className="hover:text-belek-red transition-colors">Контакты</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-bold text-2xl text-belek-black">
            <span className="text-belek-red">Белек</span> Техника
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="input-field pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-belek-red">
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4">
            
            <Link to="/cart" className="flex flex-col items-center text-center text-sm relative">
              <ShoppingCart className="h-6 w-6 mb-1" />
              <span>Корзина</span>
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-belek-red text-white" variant="destructive">
                  {itemCount}
                </Badge>
              )}
            </Link>
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories navigation */}
      <nav className="bg-belek-gray hidden md:block">
        <div className="container mx-auto">
          <ul className="flex flex-wrap">
            {categories.map((category) => (
              <li key={category.path}>
                <Link 
                  to={category.path} 
                  className="block px-4 py-3 hover:bg-belek-red hover:text-white transition-colors font-medium"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="container mx-auto px-4 py-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  className="input-field pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-500">
                  <Search size={20} />
                </button>
              </div>
            </form>
            <ul className="divide-y divide-gray-100">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link 
                    to={category.path} 
                    className="block py-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/about" className="block py-3" onClick={() => setMobileMenuOpen(false)}>О компании</Link>
              </li>
              <li>
                <Link to="/delivery" className="block py-3" onClick={() => setMobileMenuOpen(false)}>Доставка</Link>
              </li>
              <li>
                <Link to="/contacts" className="block py-3" onClick={() => setMobileMenuOpen(false)}>Контакты</Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};
