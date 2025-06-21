import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/use-cart';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import mainpage from "../../public/mainpage2.png"
import { useBrands } from '@/hooks/useBrands';
import saleimage from "../../public/saleimage.png"
import main1 from "../../public/main1.png"
import main2 from "../../public/2main.png"
import main3 from "../../public/3main.png"

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
  const { brands } = useBrands()

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
    
      }
    };

    fetchCategories();
  }, [])
   const slides = [
    {
      id: 1,
      title: "КЛИМАТИЧЕСКАЯ ТЕХНИКА",
      subtitle: "Кондиционеры",
      description: "Все для комфортного лета",
      buttonText: `/category/Климатическая%20техника/Кондиционеры`,
      image: `${main1}`,
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 30%, #330a0a 70%, #4d0000 100%)"
    },
    {
      id: 2,
      title: "ХОЛОДИЛЬНИКИ ПРЕМИУМ",
      subtitle: "КЛАССА LG SIGNATURE",
      description: "Инновации для вашей кухни",
      buttonText: "/category/Отдельностоящая%20техника/Холодильники",
      image: `${main2}`,
      background: "linear-gradient(135deg, #000000 0%, #1a0000 40%, #660000 80%, #800000 100%)"
    },
    {
      id: 3,
      title: "КУХОННАЯ ТЕХНИКА",
      subtitle: "Все для вашей кухни",
      description: "Профессиональное качество дома",
      buttonText: "Каталог",
      image: `${main3}`,
      background: "linear-gradient(135deg, #0d0d0d 0%, #200000 35%, #4d0000 75%, #990000 100%)"
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToSlide = (index) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  const current = slides[currentSlide];
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section 
      className="relative min-h-[600px] md:min-h-[700px] overflow-hidden transition-all duration-1000 ease-in-out"
      style={{ background: current.background }}
    >
      {/* Декоративные элементы фона */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-red-400/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-red-500/15 rounded-full blur-xl animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[500px]">
          
          {/* Левая часть - текст */}
          <div className="lg:w-1/2 text-white mb-8 lg:mb-0">
            <div className={`transition-all duration-700 transform ${
              isAnimating ? 'opacity-0 translate-x-[-50px]' : 'opacity-100 translate-x-0'
            }`}>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 leading-tight">
                <span className="block">{current.title}</span>
                <span className="block text-red-400">{current.subtitle}</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-md">
                {current.description}
              </p>
              
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/30">
                <Link to={current.buttonText}>
                Перейти</Link>
              </button>
            </div>
          </div>

          {/* Правая часть - изображение */}
          <div className="lg:w-1/2 relative">
            <div className={`transition-all duration-700 transform ${
              isAnimating ? 'opacity-0 scale-95 rotate-2' : 'opacity-100 scale-100 rotate-0'
            }`}>
              <div className="relative max-w-lg mx-auto">
                <img
                  src={current.image}
                  alt={current.title}
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                
                {/* Глянцевый эффект */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-2xl"></div>
                
                {/* Свечение */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-3xl blur-lg -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
        
        {/* Индикаторы */}
        <div className="flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Кнопки навигации */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

     

      {/* Градиент внизу */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
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
                      src={category.image}
                      alt={"Картинка"}
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
            <h2 className="section-header">Товары</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
              {loading && <p>Загрузка...</p>}
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
                    src={saleimage}
                    alt="Kitchen Appliances Promo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
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
          className="bg-white rounded-lg p-4 flex flex-col items-center justify-center h-32 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-full h-16 flex items-center justify-center overflow-hidden">
            <img
              src={brand.image}
              alt={brand.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
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
