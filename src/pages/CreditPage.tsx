import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import { CreditCard } from "lucide-react";

const CreditPage = () => (
  <div className="min-h-screen bg-white-900">
    
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Кредит и рассрочка</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center mb-6">
          <CreditCard className="text-red-500 mr-4" size={32} />
          <h2 className="text-3xl font-bold text-black">Рассрочка</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-black mb-4">Условия рассрочки:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• От 3 до 24 месяцев</li>
              <li>• Без переплат и скрытых комиссий</li>
              <li>• Первоначальный взнос от 0%</li>
              <li>• Быстрое оформление</li>
              <li>• Минимальный пакет документов</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-black mb-4">Необходимые документы:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Паспорт гражданина КР</li>
              <li>• Второй документ</li>
              <li>• Справка о доходах (по требованию)</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
            Оформить рассрочку
          </button>
        </div>
      </div>

    
    </main>
    
  </div>
);

export default CreditPage