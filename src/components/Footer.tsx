import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

export const Footer = () => {
  const { categories } = useCategories();
  return (
    <footer className="bg-belek-black text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">О компании</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-belek-red transition-colors">Главная</Link></li>
              <li><Link to="/" className="hover:text-belek-red transition-colors">О нас</Link></li>
              <li><Link to="/" className="hover:text-belek-red transition-colors">Доставка и оплата</Link></li>
              <li><Link to="/admin" className="hover:text-belek-red transition-colors">Администрирование</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Каталог</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.category}>
                  <Link
                    to={`/category/${category.category}`}
                    className="hover:text-belek-red transition-colors "
                  >
                    {category.category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Покупателям</h3>
            <ul className="space-y-2">
              <li><Link to="/CreditPage" className="hover:text-belek-red transition-colors">Кредит и рассрочка</Link></li>
              <li><Link to="/FAQPage" className="hover:text-belek-red transition-colors">Вопросы и ответы</Link></li>
              <li><Link to="/" className="hover:text-belek-red transition-colors">Политика конфиденциальности</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="flex items-center"><Phone size={16} className="mr-2" /> <a href="tel:+996312123456" className="hover:text-belek-red transition-colors">+996 (312) 12-34-56</a></li>
              <li className="flex items-center"><Mail size={16} className="mr-2" /> <a href="mailto:info@belektechnika.kg" className="hover:text-belek-red transition-colors">info@belektechnika.kg</a></li>
              <li className="flex items-start"><MapPin size={16} className="mr-2 mt-1 flex-shrink-0" /> <span>г. Бишкек, ул. Киевская 95, ТЦ "Сары-Озон"</span></li>
              <li className="flex items-center mt-4">
                <a href="https://facebook.com" className="mr-4 hover:text-belek-red transition-colors"><Facebook size={24} /></a>
                <a href="https://instagram.com" className="hover:text-belek-red transition-colors"><Instagram size={24} /></a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-center text-gray-400">
          <p>© 2023 Белек Техника. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

// Export as default as well for backward compatibility
export default Footer;
