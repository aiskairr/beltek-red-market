import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Package, Truck, Shield, Star, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

// Компонент "О компании"
const CompanyPage = () => {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50">
                {/* Hero Section */}
                <div className="bg-black text-white py-20 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-black/80"></div>
                    <div className="max-w-6xl mx-auto relative z-10">
                        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent">
                            ПРЕМИУМ РЕШЕНИЯ
                        </h1>
                        <p className="text-2xl mb-8 text-gray-300">
                            Ваш надежный партнер в мире качественных услуг
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-1 bg-red-600"></div>
                            <span className="text-red-400 font-semibold">С 2010 года на рынке</span>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { icon: Users, number: '10,000+', label: 'Довольных клиентов' },
                                { icon: Award, number: '15', label: 'Лет опыта' },
                                { icon: Package, number: '50,000+', label: 'Выполненных заказов' },
                                { icon: Star, number: '4.9', label: 'Рейтинг качества' }
                            ].map((stat, index) => (
                                <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                                    <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-black transition-colors">
                                        <stat.icon size={32} />
                                    </div>
                                    <div className="text-3xl font-bold text-black mb-2">{stat.number}</div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="py-20 bg-gradient-to-r from-black to-red-900 text-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-4xl font-bold mb-6">О НАШЕЙ КОМПАНИИ</h2>
                                <p className="text-xl mb-6 text-gray-300">
                                    Мы - лидеры в сфере предоставления качественных услуг. Наша команда профессионалов
                                    работает для того, чтобы каждый клиент получил максимальное качество и сервис.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        'Индивидуальный подход к каждому клиенту',
                                        'Современные технологии и методы работы',
                                        'Гарантия качества на все услуги',
                                        'Круглосуточная поддержка клиентов'
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="text-red-400" size={24} />
                                            <span className="text-lg">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/10 p-8 rounded-lg backdrop-blur-sm">
                                <h3 className="text-2xl font-bold mb-4 text-red-400">НАША МИССИЯ</h3>
                                <p className="text-lg text-gray-300">
                                    Предоставлять исключительные услуги, превосходящие ожидания клиентов,
                                    и строить долгосрочные партнерские отношения, основанные на доверии и качестве.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Preview */}
                <div className="py-16 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center mb-12 text-black">НАШИ ПРЕИМУЩЕСТВА</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Shield,
                                    title: 'НАДЕЖНОСТЬ',
                                    description: 'Гарантируем качество и безопасность всех наших услуг'
                                },
                                {
                                    icon: Clock,
                                    title: 'СКОРОСТЬ',
                                    description: 'Быстрое выполнение заказов без потери качества'
                                },
                                {
                                    icon: Award,
                                    title: 'КАЧЕСТВО',
                                    description: 'Высокие стандарты обслуживания и профессионализм'
                                }
                            ].map((service, index) => (
                                <div key={index} className="bg-gradient-to-br from-gray-50 to-red-50 p-8 rounded-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-600 group">
                                    <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-black transition-colors">
                                        <service.icon size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-black">{service.title}</h3>
                                    <p className="text-gray-600">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer /></>)
};









export default CompanyPage;