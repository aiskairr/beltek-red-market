import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Package, Truck, Shield, Star, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';


// Компонент "Доставка"
const DeliveryPage = () => {
    const [selectedOption, setSelectedOption] = useState(null);

    const deliveryOptions = [
        {
            icon: Package,
            title: 'САМОВЫВОЗ',
            time: 'сразу после звонка',
            price: 'БЕСПЛАТНО',
            description: 'Из центра выдачи в ТЦ',
            features: ['Подтверждение за 15 минут', 'SMS уведомления']
        },
        {
            icon: Truck,
            title: 'ДОСТАВКА ПО БИШКЕКУ',
            time: '1-3 рабочих дня',
            price: 'БЕСПЛАТНО',
            description: 'В радиусе 10 км при условиях',
            features: ['От 30 000 сом или 40+ кг', 'До двери']
        }
    ];

    const stores = [
        {
            name: 'ТЦ "Беш-Сары"',
            location: '1 этаж, отдел 01',
            hours: 'с 09:00 до 19:00',
            closed: 'понедельник',
            note: 'В праздничные дни — сокращённый рабочий день'
        },
        {
            name: 'ТЦ "Аю Гранд"',
            location: 'Отдел С-101/1',
            hours: 'с 09:00 до 18:00',
            closed: 'понедельник',
            note: 'В праздничные дни — сокращённый рабочий день'
        }
    ];

    const selfPickupSteps = [
        { step: 1, text: 'Выберите товар на сайте' },
        { step: 2, text: 'Оформите заказ' },
        { step: 3, text: 'Дождитесь звонка (до 15 минут)' },
        { step: 4, text: 'Получите уведомление о готовности' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50">
           
            <div className="bg-gradient-to-r from-red-600 to-black text-white py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-4">ДОСТАВКА И САМОВЫВОЗ</h1>
                    <p className="text-xl text-red-200">Быстро, удобно, по всему Кыргызстану</p>
                </div>
            </div>

            {/* Delivery Options */}
            <div className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12 text-black">ВАРИАНТЫ ПОЛУЧЕНИЯ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {deliveryOptions.map((option, index) => (
                            <div 
                                key={index} 
                                className={`bg-gradient-to-br from-white to-gray-50 p-8 rounded-lg border-2 transition-all duration-300 group cursor-pointer ${
                                    selectedOption === index 
                                        ? 'border-red-600 shadow-xl scale-105' 
                                        : 'border-gray-200 hover:border-red-600 hover:shadow-xl'
                                }`}
                                onClick={() => setSelectedOption(selectedOption === index ? null : index)}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${
                                    selectedOption === index 
                                        ? 'bg-black text-white' 
                                        : 'bg-red-600 text-white group-hover:bg-black'
                                }`}>
                                    <option.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-black">{option.title}</h3>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-red-600 font-bold text-lg">{option.time}</span>
                                    <span className="text-green-600 font-bold text-lg">{option.price}</span>
                                </div>
                                <p className="text-gray-600 mb-4">{option.description}</p>
                                <ul className="text-sm text-gray-500 space-y-1">
                                    {option.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center space-x-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Delivery Details */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12 text-black">ПОДРОБНАЯ ИНФОРМАЦИЯ</h2>
                    
                    {/* Самовывоз */}
                    <div className="bg-white rounded-lg p-8 mb-8 shadow-lg">
                        <h3 className="text-2xl font-bold mb-6 text-red-600 flex items-center">
                            <Package className="mr-3" size={28} />
                            САМОВЫВОЗ ИЗ ЦЕНТРА ВЫДАЧИ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {selfPickupSteps.map((item, index) => (
                                <div key={index} className="bg-red-50 p-4 rounded-lg text-center hover:bg-red-100 transition-colors">
                                    <div className="text-2xl font-bold text-red-600 mb-2">{item.step}</div>
                                    <p className="text-sm">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Доставка по Бишкеку */}
                    <div className="bg-white rounded-lg p-8 mb-8 shadow-lg">
                        <h3 className="text-2xl font-bold mb-6 text-red-600 flex items-center">
                            <Truck className="mr-3" size={28} />
                            ДОСТАВКА ПО ГОРОДУ БИШКЕК
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-black">Условия бесплатной доставки:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-center space-x-3">
                                        <CheckCircle className="text-green-500" size={20} />
                                        <span>В радиусе 10 км</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <CheckCircle className="text-green-500" size={20} />
                                        <span>Сумма заказа от 30 000 сом</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <CheckCircle className="text-green-500" size={20} />
                                        <span>ИЛИ общий вес товаров более 40 кг</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-black">Дополнительные услуги:</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-semibold mb-2">Ручной подъем крупногабаритного товара:</p>
                                    <ul className="text-sm space-y-1">
                                        <li>• До 40 кг — 150 сом/этаж</li>
                                        <li>• От 40 кг — 200 сом/этаж</li>
                                        <li>• Если есть лифт — бесплатно</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                            <p className="text-center text-lg">
                                <Clock className="inline mr-2" size={20} />
                                <span className="font-semibold">Срок доставки: от 1 до 3 рабочих дней</span>
                            </p>
                        </div>
                    </div>

                    {/* Доставка по Кыргызстану */}
                    <div className="bg-white rounded-lg p-8 shadow-lg">
                        <h3 className="text-2xl font-bold mb-6 text-red-600 flex items-center">
                            <MapPin className="mr-3" size={28} />
                            ДОСТАВКА ПО КЫРГЫЗСТАНУ
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-red-50 p-6 rounded-lg text-center hover:bg-red-100 transition-colors">
                                <Shield className="mx-auto mb-4 text-red-600" size={32} />
                                <h4 className="font-semibold mb-2">Курьерская служба</h4>
                                <p className="text-sm text-gray-600">Осуществляется сторонней курьерской службой</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-lg text-center hover:bg-red-100 transition-colors">
                                <CheckCircle className="mx-auto mb-4 text-red-600" size={32} />
                                <h4 className="font-semibold mb-2">Предоплата</h4>
                                <p className="text-sm text-gray-600">Доступна только после полной предоплаты</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-lg text-center hover:bg-red-100 transition-colors">
                                <Clock className="mx-auto mb-4 text-red-600" size={32} />
                                <h4 className="font-semibold mb-2">1-2 рабочих дня</h4>
                                <p className="text-sm text-gray-600">В зависимости от региона</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Addresses */}
            <div className="py-16 bg-black text-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">АДРЕСА МАГАЗИНОВ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {stores.map((store, index) => (
                            <div key={index} className="bg-gradient-to-br from-red-900/20 to-white/10 p-8 rounded-lg backdrop-blur-sm border border-white/20 hover:border-red-400 transition-colors">
                                <div className="flex items-center mb-4">
                                    <MapPin className="text-red-400 mr-3" size={24} />
                                    <h3 className="text-2xl font-bold text-red-400">{store.name}</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                        <span className="text-lg">{store.location}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="text-green-400 mr-3" size={18} />
                                        <span>Время работы: {store.hours}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                        <span className="text-red-300">Выходной: {store.closed}</span>
                                    </div>
                                    <div className="bg-yellow-500/20 p-3 rounded-lg mt-4">
                                        <p className="text-yellow-200 text-sm">{store.note}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="py-16 bg-gradient-to-r from-red-600 to-black text-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8">ЕСТЬ ВОПРОСЫ?</h2>
                    <p className="text-xl mb-8 text-red-200">Свяжитесь с нами для получения подробной информации</p>
                    <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
                        <a href="tel:+996226240808" className="flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-lg hover:bg-white/30 transition-colors">
                            <Phone size={20} />
                            <span>Позвонить в Беш Сары</span>
                        </a>
                        <a href="tel:+996557240808" className="flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-lg hover:bg-white/30 transition-colors">
                            <Phone size={20} />
                            <span>Позвонить в Аю Гранд</span>
                        </a>
                        <a href="mailto:info@example.com" className="flex items-center space-x-2 bg-white/20 px-6 py-3 rounded-lg hover:bg-white/30 transition-colors">
                            <Mail size={20} />
                            <span>Написать</span>
                        </a>
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default DeliveryPage;