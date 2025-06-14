
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Check, Minus, Plus, Truck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart, Product } from '@/hooks/use-cart';
import { ProductCard } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

// Mock all products


const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addItem, getCount } = useCart();

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      // ✅ 1. Получаем товар по ID
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError || !productData) {
        console.error("Ошибка загрузки товара:", productError?.message);
        setProduct(null);
        return;
      }

      setProduct(productData);

      // ✅ 2. Получаем похожие товары по категории
      const { data: relatedData, error: relatedError } = await supabase
        .from("products")
        .select("*")
        .eq("category", productData.category)
        .neq("id", productData.id)
        .limit(4);

      if (relatedError) {
        console.error("Ошибка загрузки похожих товаров:", relatedError.message);
      } else {
        setRelatedProducts(relatedData || []);
      }
    };

    if (productId) fetchProductAndRelated();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  // Get appropriate image based on category
  const getProductImage = (category?: string) => {
    if (!category) return '/appliance.jpg';

    switch (category) {
      case 'refrigerators':
        return '/refrigerator.jpg';
      case 'washing-machines':
        return '/washing-machine.jpg';
      case 'tvs':
        return '/tv.jpg';
      case 'kitchen':
        return product?.name.toLowerCase().includes('микроволнов')
          ? '/microwave.jpg'
          : product?.name.toLowerCase().includes('кофемашин')
            ? '/coffee-machine.jpg'
            : '/kitchen-appliance.jpg';
      case 'air-conditioners':
        return '/air-conditioner.jpg';
      case 'vacuum-cleaners':
        return '/vacuum-cleaner.jpg';
      default:
        return '/appliance.jpg';
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-belek-red">Главная</Link>
            <span className="mx-2">/</span>
            <Link to={`/category/${product.category}`} className="hover:text-belek-red">
              {product.category === 'refrigerators' && 'Холодильники'}
              {product.category === 'washing-machines' && 'Стиральные машины'}
              {product.category === 'tvs' && 'Телевизоры'}
              {product.category === 'kitchen' && 'Кухонная техника'}
              {product.category === 'air-conditioners' && 'Кондиционеры'}
              {product.category === 'vacuum-cleaners' && 'Пылесосы'}
            </Link>
            <span className="mx-2">/</span>
            <span>{product.name}</span>
          </div>

          {/* Back button */}
          <Link to={`/category/${product.category}`} className="inline-flex items-center text-sm font-medium mb-6 hover:text-belek-red">
            <ArrowLeft size={16} className="mr-1" />
            Назад к списку товаров
          </Link>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Product Image */}
              <div className="flex justify-center items-center bg-belek-gray rounded-lg p-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-full max-h-[400px] object-contain"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <div className="mb-1">
                  <Badge className="bg-belek-red/10 text-belek-red border-belek-red/30">
                    Новинка
                  </Badge>
                </div>

                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

                <div className="text-gray-500 mb-4">
                  <span>Бренд: </span>
                  <span className="font-medium text-belek-black">{product.brand}</span>
                  <span className="mx-2">·</span>
                  <span>Код товара: </span>
                  <span className="font-medium text-belek-black">BT{product.id}KG</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline mb-6">
                  <div className="text-3xl font-bold">{product.price.toLocaleString()} с</div>
                  {/* Commented out for now - can add discount price logic here */}
                  {/* <div className="text-lg text-gray-500 line-through ml-3">{(product.price * 1.2).toLocaleString()} с</div> */}
                </div>

                {/* Stock and Delivery */}
                <div className="flex items-center text-sm mb-6">
                  <div className="flex items-center text-green-600 mr-4">
                    <Check size={16} className="mr-1" />
                    <span>В наличии</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Truck size={16} className="mr-1" />
                    <span>Доставка: 1-3 дня</span>
                  </div>
                </div>

                <Separator className="mb-6" />

                {/* Add to Cart */}
                <div className="flex items-center mb-8">
                  <div className="flex items-center border rounded overflow-hidden mr-4">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="primary-button flex items-center"
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    В корзину
                  </button>

                 
                </div>

                {/* Payment Methods */}
                <div className="bg-belek-gray rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-3">Способы оплаты</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 mr-2 text-belek-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Наличными
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 mr-2 text-belek-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      Картой
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 mr-2 text-belek-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      Переводом QR
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-5 h-5 mr-2 text-belek-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Рассрочка
                    </div>
                  </div>
                </div>

                {/* Bank Logos */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-500">Банки-партнеры:</span>
                  <div className="flex space-x-3">
                    <img src="/placeholder.svg" alt="Мбанк" className="h-6" />
                    <img src="/placeholder.svg" alt="Бакай банк" className="h-6" />
                    <img src="/placeholder.svg" alt="Компаньон" className="h-6" />
                    <img src="/placeholder.svg" alt="РСК" className="h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="grid grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="specs">Характеристики</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="p-6 bg-white rounded-lg shadow mt-2">
              <h2 className="text-lg font-semibold mb-4">Описание {product.name}</h2>
              <p className="mb-4" style={{ whiteSpace: 'pre-line' }}>
                {product.description}
              </p>
            </TabsContent>
            <TabsContent value="specs" className="p-6 bg-white rounded-lg shadow mt-2">
              <h2 className="text-lg font-semibold mb-4">Технические характеристики</h2>
              <div className="divide-y">
                <div className="grid grid-cols-2 py-3">
                  <div className="font-medium">Бренд</div>
                  <div>{product.brand}</div>
                </div>
                <div className="grid grid-cols-2 py-3">
                  <div className="font-medium">Модель</div>
                  <div>{product.name.split(' ').slice(-1)[0]}</div>
                </div>
                <div className="grid grid-cols-2 py-3">
                  <div className="font-medium">Гарантия</div>
                  <div>12 месяцев</div>
                </div>
                <div className="grid grid-cols-2 py-3">
                  <div className="font-medium">Страна производства</div>
                  <div>Китай</div>
                </div>
                <div className="grid grid-cols-2 py-3">
                  <div className="font-medium">Цвет</div>
                  <div>Белый</div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="p-6 bg-white rounded-lg shadow mt-2">
              <h2 className="text-lg font-semibold mb-4">Отзывы</h2>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Отзывов пока нет</p>
                <button className="primary-button">
                  Оставить отзыв
                </button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="section-header mb-8">Похожие товары</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
