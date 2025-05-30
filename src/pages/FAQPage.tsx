
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { ChevronDown, ChevronUp, HelpCircle, Phone } from "lucide-react";
import { useState } from "react";


export const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqData = [
    {
      question: "Как оформить заказ?",
      answer: "Вы можете оформить заказ на сайте, добавив товары в корзину и следуя инструкциям, или позвонить нам по телефону."
    },
    {
      question: "Какие способы оплаты доступны?",
      answer: "Мы принимаем наличные, банковские карты, электронные платежи, а также предлагаем рассрочку и кредит."
    },
    {
      question: "Сколько времени занимает доставка?",
      answer: "Доставка по городу - 1-2 дня, по региону - 3-5 дней. Точные сроки зависят от наличия товара на складе."
    },
    {
      question: "Можно ли вернуть товар?",
      answer: "Да, согласно закону о защите прав потребителей, товар можно вернуть в течение 14 дней без объяснения причин."
    },
    {
      question: "Есть ли гарантия на товары?",
      answer: "На все товары действует официальная гарантия производителя. Срок гарантии указан в описании каждого товара."
    }
  ];

  return (
    <div className="min-h-screen bg-white-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Часто задаваемые вопросы</h1>
        
        <div className="max-w-4xl mx-auto">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg mb-4">
              <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              >
                <div className="flex items-center">
                  <HelpCircle className="text-red-500 mr-3" size={24} />
                  <h3 className="text-lg font-semibold text-black">{faq.question}</h3>
                </div>
                {openFAQ === index ? 
                  <ChevronUp className="text-red-500" size={24} /> : 
                  <ChevronDown className="text-red-500" size={24} />
                }
              </div>
              {openFAQ === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-700 ml-9">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-black rounded-lg shadow-lg p-8 mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Не нашли ответ на свой вопрос?</h2>
          <div className="text-center">
            <p className="text-white mb-6">Свяжитесь с нами любым удобным способом</p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center">
                <Phone className="text-red-500 mr-2" size={20} />
                <span className="text-white">+7 (XXX) XXX-XX-XX</span>
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors">
                Написать в чат
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

