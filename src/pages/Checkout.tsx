
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  QR = 'qr',
  INSTALLMENT = 'installment',
}

enum DeliveryMethod {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  bank: string | null;
}

const banks = [
  { id: 'mbank', name: 'Мбанк' },
  { id: 'bakaibank', name: 'Бакай банк' },
  { id: 'companion', name: 'Компаньон' },
  { id: 'rsk', name: 'РСК' },
];

const Checkout = () => {
  const { items, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Бишкек',
    notes: '',
    deliveryMethod: DeliveryMethod.DELIVERY,
    paymentMethod: PaymentMethod.CASH,
    bank: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is typed in
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    const paymentMethod = value as PaymentMethod;
    setFormData(prev => ({ 
      ...prev, 
      paymentMethod,
      bank: paymentMethod === PaymentMethod.INSTALLMENT ? 'mbank' : null
    }));
  };

  const handleDeliveryMethodChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      deliveryMethod: value as DeliveryMethod
    }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, bank: e.target.value }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.firstName) newErrors.firstName = 'Введите имя';
    if (!formData.lastName) newErrors.lastName = 'Введите фамилию';
    if (!formData.phone) newErrors.phone = 'Введите телефон';
    if (!formData.email) newErrors.email = 'Введите email';
    
    if (formData.deliveryMethod === DeliveryMethod.DELIVERY) {
      if (!formData.address) newErrors.address = 'Введите адрес доставки';
      if (!formData.city) newErrors.city = 'Введите город';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Simulate order submission
    setTimeout(() => {
      toast.success('Заказ успешно оформлен! Наш менеджер свяжется с вами в ближайшее время.');
      clearCart();
      navigate('/order-confirmation');
    }, 1500);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Оформление заказа</h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Customer Information */}
          <div className="lg:w-2/3 space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Личные данные</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+996 XXX XXX XXX"
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
            
            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Способ получения</h2>
              
              <RadioGroup 
                className="mb-4"
                value={formData.deliveryMethod}
                onValueChange={handleDeliveryMethodChange}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={DeliveryMethod.DELIVERY} id="delivery" />
                  <Label htmlFor="delivery" className="font-medium">Доставка</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={DeliveryMethod.PICKUP} id="pickup" />
                  <Label htmlFor="pickup" className="font-medium">Самовывоз из магазина</Label>
                </div>
              </RadioGroup>
              
              {formData.deliveryMethod === DeliveryMethod.DELIVERY && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Город
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="Бишкек">Бишкек</option>
                      <option value="Ош">Ош</option>
                      <option value="Джалал-Абад">Джалал-Абад</option>
                      <option value="Каракол">Каракол</option>
                      <option value="Нарын">Нарын</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес доставки
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Улица, дом, квартира"
                      className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                  </div>
                </div>
              )}
              
              {formData.deliveryMethod === DeliveryMethod.PICKUP && (
                <div className="mt-4 p-4 bg-belek-gray rounded-lg">
                  <div className="font-medium mb-2">Адрес магазина:</div>
                  <p className="text-gray-700">г. Бишкек, ул. Киевская 123</p>
                  <p className="text-gray-700">Время работы: Пн-Сб: 9:00 - 18:00</p>
                  <p className="text-gray-700">Телефон: +996 555 123 456</p>
                </div>
              )}
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Способ оплаты</h2>
              
              <RadioGroup 
                className="space-y-3"
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
              >
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <RadioGroupItem value={PaymentMethod.CASH} id="cash" />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="cash" className="font-medium">Наличными при получении</Label>
                    <p className="text-gray-500">Оплата наличными при доставке или самовывозе</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <RadioGroupItem value={PaymentMethod.CARD} id="card" />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="card" className="font-medium">Оплата картой при получении</Label>
                    <p className="text-gray-500">Visa, MasterCard</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <RadioGroupItem value={PaymentMethod.QR} id="qr" />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="qr" className="font-medium">Перевод по QR-коду</Label>
                    <p className="text-gray-500">Отсканируйте QR-код и произведите оплату через мобильный банкинг</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <RadioGroupItem value={PaymentMethod.INSTALLMENT} id="installment" />
                  </div>
                  <div className="ml-3 text-sm">
                    <Label htmlFor="installment" className="font-medium">Рассрочка</Label>
                    <p className="text-gray-500">Покупка в рассрочку через банк-партнер</p>
                  </div>
                </div>
              </RadioGroup>
              
              {formData.paymentMethod === PaymentMethod.INSTALLMENT && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Выберите банк
                  </label>
                  <select
                    name="bank"
                    value={formData.bank || ''}
                    onChange={handleBankChange}
                    className="input-field"
                  >
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Дополнительно</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий к заказу
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Дополнительная информация о заказе, особые пожелания..."
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Ваш заказ</h2>
              
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.quantity} x {item.price.toLocaleString()} с</div>
                    </div>
                    <div className="font-medium">
                      {(item.price * item.quantity).toLocaleString()} с
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Товаров ({items.length})</span>
                  <span>{getTotal().toLocaleString()} с</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Доставка</span>
                  <span>Бесплатно</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                  <span>Итого</span>
                  <span>{getTotal().toLocaleString()} с</span>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full primary-button flex items-center justify-center py-3 mt-6"
              >
                Оформить заказ
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Нажимая кнопку "Оформить заказ", вы соглашаетесь с условиями покупки
              </p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
