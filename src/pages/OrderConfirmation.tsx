import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const OrderConfirmation = () => {
  // Generate a random order number
  const orderNumber = `BT-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Спасибо за заказ!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Ваш заказ №{orderNumber} успешно оформлен
          </p>
          
          <div className="bg-belek-gray rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-4">Что дальше?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 bg-belek-red rounded-full text-white mr-3">
                  1
                </span>
                <span>В ближайшее время с вами свяжется наш менеджер для подтверждения заказа</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 bg-belek-red rounded-full text-white mr-3">
                  2
                </span>
                <span>Мы подготовим ваш заказ и согласуем время доставки</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 bg-belek-red rounded-full text-white mr-3">
                  3
                </span>
                <span>Доставим заказ по указанному адресу или подготовим к самовывозу</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="primary-button">
              Вернуться на главную
            </Link>
            <Link to="/category/all" className="secondary-button">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
