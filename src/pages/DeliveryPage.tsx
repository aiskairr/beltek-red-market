
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Package, Truck, Shield, Star, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
// Компонент "Доставка"
const DeliveryPage = () => (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-black text-white py-16 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-5xl font-bold mb-4">ДОСТАВКА И ЛОГИСТИКА</h1>
                <p className="text-xl text-red-200">Быстро, надежно, по всей стране</p>
            </div>
        </div>

        {/* Delivery Options */}
        <div className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12 text-black">ВАРИАНТЫ ДОСТАВКИ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Truck,
                            title: 'ЭКСПРЕСС ДОСТАВКА',
                            time: '1-2 дня',
                            price: 'от 500сом',
                            description: 'Срочная доставка по городу и области'
                        },
                        {
                            icon: Package,
                            title: 'СТАНДАРТНАЯ',
                            time: '3-5 дней',
                            price: 'от 250сом',
                            description: 'Оптимальное соотношение цены и скорости'
                        },
                        {
                            icon: Clock,
                            title: 'ЭКОНОМНАЯ',
                            time: '5-7 дней',
                            price: 'от 150сом',
                            description: 'Выгодная доставка без спешки'
                        }
                    ].map((option, index) => (
                        <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-lg border-2 border-gray-200 hover:border-red-600 hover:shadow-xl transition-all duration-300 group">
                            <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-black transition-colors">
                                <option.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-black">{option.title}</h3>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-red-600 font-bold text-lg">{option.time}</span>
                                <span className="text-black font-bold text-lg">{option.price}</span>
                            </div>
                            <p className="text-gray-600">{option.description}</p>
                            <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-black transition-colors flex items-center space-x-2">
                                <span>Выбрать</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Delivery Map */}
        <div className="py-16 bg-black text-white">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12">ГЕОГРАФИЯ ДОСТАВКИ</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-red-400">МЫ ДОСТАВЛЯЕМ:</h3>
                        <div className="space-y-4">
                            {[
                                { region: 'По всему Кыргызстану', time: '1-14 дней' },
                                { region: 'СНГ страны', time: '5-21 день' },
                                { region: 'Международная доставка', time: '7-30 дней' },
                                { region: 'Экспресс по Бишкеку', time: 'в день заказа' }
                            ].map((item, index) => (
                                <div key={index} className="flex justify-between items-center bg-white/10 p-4 rounded-lg">
                                    <span className="text-lg">{item.region}</span>
                                    <span className="text-red-400 font-semibold">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-900/20 to-white/10 p-8 rounded-lg backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-4 text-red-400">УСЛОВИЯ ДОСТАВКИ</h3>
                        <ul className="space-y-3 text-gray-300">
                            <li>• Бесплатная доставка от 2000сом</li>
                            <li>• Страхование груза включено</li>
                            <li>• Отслеживание в реальном времени</li>
                            <li>• Доставка до двери</li>
                            <li>• Возможность примерки при получении</li>
                            <li>• SMS уведомления о статусе</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

       
    </div>
    
    <Footer />
    </>

);

export default DeliveryPage;