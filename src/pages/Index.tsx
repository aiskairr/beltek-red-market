
import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/use-cart';

// Mock data for featured products
const featuredProducts: Product[] = [
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
];

// Mock data for discounted products
const discountedProducts: Product[] = [
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
];

// Brands data
const brands = [
  { name: 'LG', logo: '/placeholder.svg' },
  { name: 'Samsung', logo: '/placeholder.svg' },
  { name: 'Ferre', logo: '/placeholder.svg' },
  { name: 'Blesk', logo: '/placeholder.svg' },
  { name: 'Midea', logo: '/placeholder.svg' },
  { name: 'Бирюса', logo: '/placeholder.svg' },
  { name: 'Vestel', logo: '/placeholder.svg' },
  { name: 'Avangard', logo: '/placeholder.svg' },
];

// Categories data
const categories = [
  { name: 'Холодильники', image: '/placeholder.svg', slug: 'refrigerators' },
  { name: 'Стиральные машины', image: '/placeholder.svg', slug: 'washing-machines' },
  { name: 'Телевизоры', image: '/placeholder.svg', slug: 'tvs' },
  { name: 'Кухонная техника', image: '/placeholder.svg', slug: 'kitchen' },
  { name: 'Кондиционеры', image: '/placeholder.svg', slug: 'air-conditioners' },
  { name: 'Пылесосы', image: '/placeholder.svg', slug: 'vacuum-cleaners' },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative bg-belek-black text-white">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 z-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  Лучшая бытовая техника для вашего дома
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-300">
                  Широкий ассортимент товаров от ведущих производителей с доставкой по всему Кыргызстану
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/category/all" className="primary-button">
                    Смотреть каталог
                  </Link>
                  <Link to="/promo" className="outline-button">
                    Акции и скидки
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <img 
                  src="/placeholder.svg" 
                  alt="Home Appliances" 
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Categories */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="section-header">Популярные категории</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="bg-belek-gray rounded-lg p-4 text-center transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-square bg-white rounded-lg flex items-center justify-center mb-3">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="max-h-[80%] max-w-[80%] object-contain"
                    />
                  </div>
                  <h3 className="font-medium">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-16 bg-belek-gray">
          <div className="container mx-auto px-4">
            <h2 className="section-header">Популярные товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/category/all" className="primary-button">
                Смотреть все товары
              </Link>
            </div>
          </div>
        </section>

        {/* Promo Banner */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="bg-belek-red rounded-lg overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 p-8 md:p-12 text-white">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Скидки до 30% на технику для кухни</h2>
                  <p className="text-lg mb-6">
                    Только до конца месяца! Успейте приобрести технику для кухни по выгодным ценам.
                  </p>
                  <Link to="/promo" className="bg-white text-belek-red py-2 px-6 rounded font-medium hover:bg-white/90 transition-colors inline-block">
                    Подробнее
                  </Link>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="/placeholder.svg" 
                    alt="Kitchen Appliances Promo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Discounted Products */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="section-header">Скидки и акции</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {discountedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/promo" className="primary-button">
                Все акции и скидки
              </Link>
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-12 md:py-16 bg-belek-gray">
          <div className="container mx-auto px-4">
            <h2 className="section-header">Наши бренды</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
              {brands.map((brand) => (
                <div 
                  key={brand.name} 
                  className="bg-white rounded-lg p-4 flex items-center justify-center h-24 shadow-sm hover:shadow-md transition-shadow"
                >
                  <img src={brand.logo} alt={brand.name} className="max-h-12" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-belek-gray p-6 rounded-lg text-center">
                <div className="bg-belek-red w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Быстрая доставка</h3>
                <p className="text-gray-600">Доставка по Бишкеку в течение 24 часов</p>
              </div>
              <div className="bg-belek-gray p-6 rounded-lg text-center">
                <div className="bg-belek-red w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Гарантия качества</h3>
                <p className="text-gray-600">Только оригинальные товары с гарантией</p>
              </div>
              <div className="bg-belek-gray p-6 rounded-lg text-center">
                <div className="bg-belek-red w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Удобная оплата</h3>
                <p className="text-gray-600">Наличными, картой или в рассрочку</p>
              </div>
              <div className="bg-belek-gray p-6 rounded-lg text-center">
                <div className="bg-belek-red w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2">Поддержка 24/7</h3>
                <p className="text-gray-600">Наши специалисты всегда готовы помочь</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
