
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  brand: string;
  in_stock: boolean;
  price: number;
  images: string;
  category: string;
  description: string;
  templates?: Array<{
    name: string;
    value: string;
  }>;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: (id: string) => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        calculateItemCount(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    calculateItemCount(items);
  }, [items]);

  const calculateItemCount = (cartItems: CartItem[]) => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);
  };

  const addItem = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        toast.success(`Количество ${product.name} обновлено в корзине`);
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success(`${product.name} добавлен в корзину`);
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find(item => item.id === id);
      if (itemToRemove) {
        toast.info(`${itemToRemove.name} удален из корзины`);
      }
      return prevItems.filter((item) => item.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Корзина очищена');
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCount = (id: string) => {
    const item = items.find((item) => item.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getCount,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
