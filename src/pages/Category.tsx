
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/hooks/use-cart';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Mock data for products
const allProducts: Product[] = [
  {
    id: '1',
    name: 'Холодильник LG GC-B247SVUV',
    brand: 'LG',
    price: 79990,
    image: '/placeholder.svg',
    category: 'refrigerators',
  },
  {
    id: '2',
    name: 'Стиральная машина Samsung WW90T986CSX',
    brand: 'Samsung',
    price: 54990,
    image: '/placeholder.svg',
    category: 'washing-machines',
  },
  {
    id: '3',
    name: 'Телевизор LG OLED65C1',
    brand: 'LG',
    price: 129990,
    image: '/placeholder.svg',
    category: 'tvs',
  },
  {
    id: '4',
    name: 'Микроволновая печь Midea MM720CPI',
    brand: 'Midea',
    price: 12990,
    image: '/placeholder.svg',
    category: 'kitchen',
  },
  {
    id: '5',
    name: 'Пылесос Samsung VS20T7536T5',
    brand: 'Samsung',
    price: 24990,
    image: '/placeholder.svg',
    category: 'vacuum-cleaners',
  },
  {
    id: '6',
    name: 'Кондиционер Midea Blanc MA-12N8D0-I/MA-12N8D0-O',
    brand: 'Midea',
    price: 32990,
    image: '/placeholder.svg',
    category: 'air-conditioners',
  },
  {
    id: '7',
    name: 'Посудомоечная машина Indesit DSFE 1B10',
    brand: 'Indesit',
    price: 29990,
    image: '/placeholder.svg',
    category: 'kitchen',
  },
  {
    id: '8',
    name: 'Кофемашина Ferre FCM2601',
    brand: 'Ferre',
    price: 18990,
    image: '/placeholder.svg',
    category: 'kitchen',
  },
  {
    id: '9',
    name: 'Холодильник Samsung RF50A5002S9',
    brand: 'Samsung',
    price: 89990,
    image: '/placeholder.svg',
    category: 'refrigerators',
  },
  {
    id: '10',
    name: 'Телевизор Samsung QN90A',
    brand: 'Samsung',
    price: 109990,
    image: '/placeholder.svg',
    category: 'tvs',
  },
  {
    id: '11',
    name: 'Стиральная машина Indesit IWSB 5085',
    brand: 'Indesit',
    price: 24990,
    image: '/placeholder.svg',
    category: 'washing-machines',
  },
  {
    id: '12',
    name: 'Пылесос Midea VCS141',
    brand: 'Midea',
    price: 7990,
    image: '/placeholder.svg',
    category: 'vacuum-cleaners',
  },
];

const categoryNames: Record<string, string> = {
  'all': 'Все товары',
  'refrigerators': 'Холодильники',
  'washing-machines': 'Стиральные машины',
  'tvs': 'Телевизоры',
  'kitchen': 'Кухонная техника',
  'air-conditioners': 'Кондиционеры',
  'vacuum-cleaners': 'Пылесосы',
};

const brands = ['LG', 'Samsung', 'Ferre', 'Blesk', 'Midea', 'Бирюса', 'Vestel', 'Avangard', 'Indesit', 'Avest', 'Техномир'];

const Category = () => {
  const { categorySlug = 'all' } = useParams<{ categorySlug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Find min and max prices across all products
  const minPrice = Math.min(...allProducts.map(product => product.price));
  const maxPrice = Math.max(...allProducts.map(product => product.price));
  
  // Load products based on category
  useEffect(() => {
    // Filter products based on category
    const categoryProducts = 
      categorySlug === 'all' 
        ? allProducts 
        : allProducts.filter(product => product.category === categorySlug);
    
    setProducts(categoryProducts);
    setPriceRange([minPrice, maxPrice]);
  }, [categorySlug]);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Filter by brand
    if (selectedBrands.length > 0) {
      result = result.filter(product => selectedBrands.includes(product.brand));
    }
    
    // Filter by price range
    result = result.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        // No specific sorting for featured
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedBrands, priceRange, sortBy]);
  
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
  };
  
  const availableBrands = Array.from(new Set(products.map(product => product.brand)));
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{categoryNames[categorySlug] || 'Товары'}</h1>
          <p className="text-gray-600">Найдено товаров: {filteredProducts.length}</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="lg:w-1/4 hidden lg:block">
            <div className="bg-white rounded-lg shadow divide-y">
              {/* Price Range */}
              <div className="p-4">
                <h3 className="font-medium mb-4">Цена</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[minPrice, maxPrice]}
                    min={minPrice}
                    max={maxPrice}
                    step={1000}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>{priceRange[0].toLocaleString()} с</span>
                    <span>{priceRange[1].toLocaleString()} с</span>
                  </div>
                </div>
              </div>
              
              {/* Brand Filter */}
              <div className="p-4">
                <h3 className="font-medium mb-4">Бренд</h3>
                <div className="space-y-2">
                  {availableBrands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => handleBrandToggle(brand)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Products */}
          <div className="lg:w-3/4">
            {/* Sort and Filter Controls */}
            <div className="flex justify-between items-center mb-6">
              <button 
                className="lg:hidden flex items-center gap-2 text-sm font-medium bg-white py-2 px-3 rounded border"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                </svg>
                Фильтры
              </button>
              
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm mr-2 hidden sm:inline">Сортировать по:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-sm py-2"
                >
                  <option value="featured">По умолчанию</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                  <option value="name-asc">По названию</option>
                </select>
              </div>
            </div>
            
            {/* Mobile Filters */}
            {mobileFiltersOpen && (
              <div className="bg-white rounded-lg shadow mb-6 p-4 lg:hidden">
                <h3 className="font-medium mb-4">Фильтры</h3>
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Цена</h4>
                  <div className="px-2">
                    <Slider
                      defaultValue={[minPrice, maxPrice]}
                      min={minPrice}
                      max={maxPrice}
                      step={1000}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm">
                      <span>{priceRange[0].toLocaleString()} с</span>
                      <span>{priceRange[1].toLocaleString()} с</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-3">Бренд</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availableBrands.map(brand => (
                      <div key={brand} className="flex items-center">
                        <Checkbox
                          id={`mobile-brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <Label htmlFor={`mobile-brand-${brand}`} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Товары не найдены</h3>
                <p className="text-gray-600 mb-4">Попробуйте изменить параметры фильтрации</p>
                <button 
                  onClick={() => {
                    setSelectedBrands([]);
                    setPriceRange([minPrice, maxPrice]);
                    setSortBy('featured');
                  }}
                  className="primary-button"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category;
