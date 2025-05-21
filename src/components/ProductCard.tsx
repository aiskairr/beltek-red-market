
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product, useCart } from '@/hooks/use-cart';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
  };

  // Get appropriate image based on category
  const getProductImage = () => {
    switch (product.category) {
      case 'refrigerators':
        return '/refrigerator.jpg';
      case 'washing-machines':
        return '/washing-machine.jpg';
      case 'tvs':
        return '/tv.jpg';
      case 'kitchen':
        return product.name.toLowerCase().includes('микроволнов') 
          ? '/microwave.jpg' 
          : product.name.toLowerCase().includes('кофемашин') 
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

  return (
    <div className="product-card group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative pt-[100%] overflow-hidden">
          <img 
            src={getProductImage()} 
            alt={product.name} 
            className="absolute top-0 left-0 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <div className="flex flex-col gap-2">
              <span className="bg-belek-red text-white text-xs px-2 py-1 rounded">Новинка</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
          <h3 className="font-medium text-belek-black line-clamp-2 h-12">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="font-bold text-lg">{product.price.toLocaleString()} с</div>
          </div>
        </div>
        
        <div className="product-actions">
          <button 
            onClick={handleAddToCart}
            className="bg-belek-red text-white px-3 py-1.5 rounded flex items-center justify-center hover:bg-red-700 transition-colors"
          >
            <ShoppingCart size={18} className="mr-1" />
            <span>В корзину</span>
          </button>
          <button className="text-white hover:text-belek-red transition-colors">
            <Heart size={20} />
          </button>
        </div>
      </Link>
    </div>
  );
};
