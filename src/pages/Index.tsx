
import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/use-cart';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import mainpage from "../../public/mainpage2.png"



// Brands data
const brands = [
  { name: 'LG', logo: '/logo-lg.png' },
  { name: 'Samsung', logo: '/logo-samsung.png' },
  { name: 'Ferre', logo: '/logo-ferre.png' },
  { name: 'Blesk', logo: '/logo-blesk.png' },
  { name: 'Midea', logo: '/logo-midea.png' },
  { name: 'Бирюса', logo: '/logo-biryusa.png' },
  { name: 'Vestel', logo: '/logo-vestel.png' },
  { name: 'Avangard', logo: '/logo-avangard.png' },
];

// Categories data
const categories = [
  { name: 'Холодильники', image: '/category-refrigerators.jpg', slug: 'refrigerators' },
  { name: 'Стиральные машины', image: '/category-washing-machines.jpg', slug: 'washing-machines' },
  { name: 'Телевизоры', image: '/category-tvs.jpg', slug: 'tvs' },
  { name: 'Кухонная техника', image: '/category-kitchen.jpg', slug: 'kitchen' },
  { name: 'Кондиционеры', image: '/category-air-conditioners.jpg', slug: 'air-conditioners' },
  { name: 'Пылесосы', image: '/category-vacuum-cleaners.jpg', slug: 'vacuum-cleaners' },
];

const Index = () => {

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8); // можно изменить лимит

      if (error) {
        console.error("Ошибка загрузки товаров:", error.message);
      } else {
        setFeaturedProducts(data || []);
      }

      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("category", { ascending: true });

      if (error) {
        console.error("Ошибка загрузки категорий:", error.message);
      } else {
        setCategories(data || []);
        console.log(data)
      }
    };

    fetchCategories();
  }, [])

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
                  src={mainpage}
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
                  key={category.category}
                  to={`/category/${category.category}`}
                  className="bg-belek-gray rounded-lg p-4 text-center transition-transform hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-square bg-white rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                    <img
                      src={""}
                      alt={""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium">{category.category}</h3>
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
                    src="/promo-kitchen.jpg"
                    alt="Kitchen Appliances Promo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Discounted Products */}
        {/* <section className="py-12 md:py-16">
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
        </section> */}

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
