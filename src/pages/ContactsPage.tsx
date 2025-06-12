import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Package, Truck, Shield, Star, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

// Компонент "Контакты"
const ContactsPage = () => (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-red-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-red-900 text-white py-16 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <h1 className="text-5xl font-bold mb-4">КОНТАКТЫ</h1>
                <p className="text-xl text-gray-300">Свяжитесь с нами любым удобным способом</p>
            </div>
        </div>

        {/* Contact Cards */}
        <div className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Phone,
                            title: 'ТЕЛЕФОНЫ',
                            info: ['+996 555 555 555', '+996 555 555 555'],
                            subtitle: 'Круглосуточно'
                        },
                        {
                            icon: Mail,
                            title: 'EMAIL',
                            info: ['info@company.ru', 'support@company.ru'],
                            subtitle: 'Ответим в течение часа'
                        },
                        {
                            icon: MapPin,
                            title: 'АДРЕС',
                            info: ['Ошский рынок — ул. Бейшеналиевой, 42', 'АЮ GRAND — Валиханова 2 ст8, 1 этаж, 101/1'],
                            subtitle: 'Пн-Пт: 9:00-18:00'
                        }
                    ].map((contact, index) => (
                        <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-lg border-2 border-gray-200 hover:border-red-600 hover:shadow-xl transition-all duration-300 group text-center">
                            <div className="bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black transition-colors">
                                <contact.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-black">{contact.title}</h3>
                            {contact.info.map((item, i) => (
                                <div key={i} className="text-lg text-gray-700 mb-2">{item}</div>
                            ))}
                            <div className="text-red-600 font-semibold mt-4">{contact.subtitle}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      

        {/* Office Info */}
        <div className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-4xl font-bold text-center mb-12 text-black">НАШ ОФИС</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-gradient-to-br from-gray-50 to-red-50 p-8 rounded-lg">
                        <h3 className="text-2xl font-bold mb-6 text-black">РЕЖИМ РАБОТЫ</h3>
                        <div className="space-y-4">
                            {[
                                { day: 'Понедельник - Пятница', time: '9:00 - 18:00' },
                                { day: 'Суббота', time: '10:00 - 16:00' },
                                { day: 'Воскресенье', time: 'Выходной' },
                                { day: 'Горячая линия', time: '24/7' }
                            ].map((schedule, index) => (
                                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                                    <span className="text-gray-700">{schedule.day}</span>
                                    <span className="font-semibold text-red-600">{schedule.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-black to-red-900 text-white p-8 rounded-lg">
                        <h3 className="text-2xl font-bold mb-6">КАК НАС НАЙТИ</h3>
                        <div className="space-y-4">
                            <p className="text-gray-300">Ошский рынок — ул. Бейшеналиевой, 42</p>
                            <p className="text-gray-300">АЮ GRAND — Валиханова 2 ст8, 1 этаж, 101/1</p>
                        </div>
                       
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Footer />
</>);

export default ContactsPage;