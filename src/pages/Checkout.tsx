import React, { useState } from 'react';

// Мок-хуки и компонентов для демонстрации
const useCart = () => ({
  items: [
    { id: 1, name: 'Смартфон Samsung Galaxy', price: 25000, quantity: 1 },
    { id: 2, name: 'Наушники AirPods', price: 8000, quantity: 2 }
  ],
  getTotal: () => 41000,
  clearCart: () => console.log('Корзина очищена')
});

const useNavigate = () => (path) => console.log(`Навигация к: ${path}`);

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
  pickupBranch: string;
}

const banks = [
  { id: 'mbank', name: 'МБанк' },
  { id: 'bakaibank', name: 'Бакай Банк' },
  { id: 'companion', name: 'Компаньон' },
  { id: 'rsk', name: 'РСК Банк' },
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
    pickupBranch: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Очистить ошибку при вводе
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

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Введите имя';
    if (!formData.lastName.trim()) newErrors.lastName = 'Введите фамилию';
    if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
    if (!formData.email.trim()) newErrors.email = 'Введите email';

    if (formData.deliveryMethod === DeliveryMethod.DELIVERY) {
      if (!formData.address.trim()) newErrors.address = 'Введите адрес доставки';
      if (!formData.city.trim()) newErrors.city = 'Введите город';
    }

    if (formData.deliveryMethod === DeliveryMethod.PICKUP && !formData.pickupBranch) {
      newErrors.pickupBranch = 'Выберите филиал для самовывоза';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Наличными';
      case PaymentMethod.CARD:
        return 'Картой';
      case PaymentMethod.QR:
        return 'QR-код';
      case PaymentMethod.INSTALLMENT:
        return 'Рассрочка';
      default:
        return '—';
    }
  };

  const getBankName = (id: string | null) => {
    const bank = banks.find(b => b.id === id);
    return bank ? bank.name : '—';
  };

  const handleSubmit = async () => {

    if (!validate()) return;

    // Формирование сообщения для WhatsApp
    const message = `🛒 Новый заказ!
Имя: ${formData.firstName} ${formData.lastName}
Телефон: ${formData.phone}
Email: ${formData.email}
Способ доставки: ${formData.deliveryMethod === DeliveryMethod.DELIVERY ? 'Доставка' : 'Самовывоз'}
${formData.deliveryMethod === DeliveryMethod.PICKUP
      ? `Самовывоз: ${formData.pickupBranch}`
      : `Город: ${formData.city}\nАдрес: ${formData.address}`
    }
Способ оплаты: ${paymentMethodLabel(formData.paymentMethod)}${formData.paymentMethod === PaymentMethod.INSTALLMENT ? ` (${getBankName(formData.bank)})` : ''}
Комментарий: ${formData.notes || '—'}

Товары:
${items.map(item => `• ${item.name} — ${item.quantity} шт. ${item.price.toLocaleString()} с`).join('\n')}

💰 Итого: ${getTotal().toLocaleString()} с`;

    // WhatsApp номер (замените на реальный)
    const whatsappNumber = '996703763346';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Открытие WhatsApp
    window.open(whatsappUrl, '_blank');

    // Очистка корзины и редирект
    clearCart();
    navigate('/order-confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Оформление заказа</h1>

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          {/* Левая колонка - Информация о клиенте */}
          <div className="lg:w-2/3 space-y-6">
            {/* Личные данные */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Личные данные</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+996 XXX XXX XXX"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Способ получения */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Способ получения</h2>

              <div className="space-y-3 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={DeliveryMethod.DELIVERY}
                    checked={formData.deliveryMethod === DeliveryMethod.DELIVERY}
                    onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">Доставка</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={DeliveryMethod.PICKUP}
                    checked={formData.deliveryMethod === DeliveryMethod.PICKUP}
                    onChange={(e) => handleDeliveryMethodChange(e.target.value)}
                    className="mr-3"
                  />
                  <span className="font-medium">Самовывоз из магазина</span>
                </label>
              </div>

              {formData.deliveryMethod === DeliveryMethod.DELIVERY && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Город
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Бишкек">Бишкек</option>
                      <option value="Ош">Ош</option>
                      <option value="Джалал-Абад">Джалал-Абад</option>
                      <option value="Каракол">Каракол</option>
                      <option value="Нарын">Нарын</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Адрес доставки *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Улица, дом, квартира"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                  </div>
                </div>
              )}

              {formData.deliveryMethod === DeliveryMethod.PICKUP && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите филиал *
                  </label>
                  <select
                    name="pickupBranch"
                    value={formData.pickupBranch}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.pickupBranch ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Выберите филиал</option>
                    <option value="Ошский рынок, ул. Бейшеналиевой, 42">
                      Ошский рынок — ул. Бейшеналиевой, 42
                    </option>
                    <option value="АЮ GRAND, ул. Валиханова 2 ст8, 1 этаж, 101/1 бутик">
                      АЮ GRAND — Валиханова 2 ст8, 1 этаж, 101/1
                    </option>
                  </select>
                  {errors.pickupBranch && <p className="text-sm text-red-500 mt-1">{errors.pickupBranch}</p>}
                </div>
              )}
            </div>

            {/* Способ оплаты */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Способ оплаты</h2>

              <div className="space-y-4">
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={PaymentMethod.CASH}
                    checked={formData.paymentMethod === PaymentMethod.CASH}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">Наличными при получении</div>
                    <div className="text-sm text-gray-500">Оплата наличными при доставке или самовывозе</div>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={PaymentMethod.CARD}
                    checked={formData.paymentMethod === PaymentMethod.CARD}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">Оплата картой при получении</div>
                    <div className="text-sm text-gray-500">Visa, MasterCard</div>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={PaymentMethod.QR}
                    checked={formData.paymentMethod === PaymentMethod.QR}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">Перевод по QR-коду</div>
                    <div className="text-sm text-gray-500">Отсканируйте QR-код и произведите оплату</div>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={PaymentMethod.INSTALLMENT}
                    checked={formData.paymentMethod === PaymentMethod.INSTALLMENT}
                    onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">Рассрочка</div>
                    <div className="text-sm text-gray-500">Покупка в рассрочку через банк-партнер</div>
                  </div>
                </label>
              </div>

              {formData.paymentMethod === PaymentMethod.INSTALLMENT && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите банк
                  </label>
                  <select
                    name="bank"
                    value={formData.bank || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Комментарий */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Дополнительно</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий к заказу
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Дополнительная информация о заказе, особые пожелания..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Правая колонка - Сводка заказа */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b">
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.quantity} x {item.price.toLocaleString()} с</div>
                    </div>
                    <div className="font-medium">
                      {(item.price * item.quantity).toLocaleString()} с
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Товаров ({items.length})</span>
                  <span>{getTotal().toLocaleString()} с</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Доставка</span>
                  <span>Бесплатно</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Итого</span>
                  <span>{getTotal().toLocaleString()} с</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium mt-6"
              >
                Оформить заказ
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Нажимая кнопку "Оформить заказ", вы соглашаетесь с условиями покупки
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;