import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingCart, User, X, ChevronDown, ChevronUp, Phone, Mail, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { moySkladAPI, cleanCategoryName } from "@/lib/moysklad";
import { SubCategory } from "@/hooks/useCategories";

export const Header = ({ categories }: any) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedMobileCategories, setExpandedMobileCategories] = useState(new Set());
  const [expandedMobileSubCategories, setExpandedMobileSubCategories] = useState(new Set());

  const handleMouseEnter = (categoryIndex) => {
    setActiveDropdown(categoryIndex);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  // Функция для переключения раскрытия мобильных категорий
  const toggleMobileCategory = (categoryName) => {
    const newExpanded = new Set(expandedMobileCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedMobileCategories(newExpanded);
  };

  // Функция для переключения раскрытия мобильных подкатегорий третьего уровня
  const toggleMobileSubCategory = (subCategoryKey) => {
    const newExpanded = new Set(expandedMobileSubCategories);
    if (newExpanded.has(subCategoryKey)) {
      newExpanded.delete(subCategoryKey);
    } else {
      newExpanded.add(subCategoryKey);
    }
    setExpandedMobileSubCategories(newExpanded);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search products in MoySklad
  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await moySkladAPI.getProducts({
        search: query,
        limit: 8
      });

      const products = response.rows.map(p => {
        return {
          id: p.id,
          name: p.name,
          price: (p.salePrices?.[0]?.value || 0) / 100,
          image: '', // Images would need separate fetch
          brand: p.attributes?.find(a => a.name.toLowerCase() === 'бренд')?.value || '',
          category: p.pathName?.split('/')[0] || '' // Keep original for routing
        };
      });

      setSearchResults(products || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Ошибка поиска:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " с";
  };

  const getCategoryName = (category) => {
    const categoryMap = {
      refrigerators: "Холодильники",
      "washing-machines": "Стиральные машины",
      tvs: "Телевизоры",
      kitchen: "Кухонная техника",
      "air-conditioners": "Кондиционеры",
      "vacuum-cleaners": "Пылесосы",
    };
    return categoryMap[category] || category;
  };

  // Функция для закрытия мобильного меню
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setExpandedMobileCategories(new Set());
    setExpandedMobileSubCategories(new Set());
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-belek-black text-white px-4 py-2">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-sm hidden md:block">
            <li className="flex items-center"><Phone size={16} className="mr-2" />Беш Сары: <a href="tel:+996226240808" className="hover:text-belek-red transition-colors">+996 226 240 808</a></li>
            <li className="flex items-center"><Phone size={16} className="mr-2" />Аю Гранд: <a href="tel:+996557240808" className="hover:text-belek-red transition-colors">+996 557 240 808</a></li>

            <li className="flex items-center">   <Mail /> {" "}<span>Email: belektehnika@gmail.com</span></li>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/about"
              className="hover:text-belek-red transition-colors"
            >
              О компании
            </Link>
            <Link
              to="/delivery"
              className="hover:text-belek-red transition-colors"
            >
              Доставка
            </Link>
            <Link
              to="/contacts"
              className="hover:text-belek-red transition-colors"
            >
              Контакты
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button - СЛЕВА */}
          <button
            className="md:hidden mr-3"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="font-bold text-2xl text-belek-black">
            <span className="text-belek-red">Белек</span> Техника
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full" ref={searchRef}>
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  className="input-field pr-20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                />
                <div className="absolute right-0 top-0 h-full flex items-center">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-2 text-gray-500 hover:text-belek-red"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3 text-gray-500 hover:text-belek-red"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div
                ref={resultsRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50"
              >
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-belek-red mx-auto"></div>
                    <p className="mt-2">Поиск...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.brand} •{" "}
                            {getCategoryName(product.category)}
                          </p>
                          <p className="text-sm font-semibold text-belek-red">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {searchQuery && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={() => {
                            navigate(
                              `/search?q=${encodeURIComponent(searchQuery)}`
                            );
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                          className="text-sm text-belek-red hover:underline"
                        >
                          Показать все результаты для "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </>
                ) : searchQuery && !searchLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <p>Ничего не найдено по запросу "{searchQuery}"</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/cart"
              className="flex flex-col items-center text-center text-sm relative"
            >
              <ShoppingCart className="h-6 w-6 mb-1" />
              <span>Корзина</span>
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 bg-belek-red text-white"
                  variant="destructive"
                >
                  {itemCount}
                </Badge>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Categories navigation */}
      <nav className="bg-belek-gray hidden md:block relative">
        <div className="container mx-auto">
          <ul className="flex flex-wrap">
            {categories?.map((category, index) => (
              <li
                key={category.category}
                className="relative group"
              >
                <Link
                  to={`/category/${encodeURIComponent(category.category)}`}
                  className="block px-4 py-3 hover:bg-belek-red hover:text-white transition-colors font-medium flex items-center"
                >
                  {cleanCategoryName(category.category)}
                  {category.mini_categories_detailed && category.mini_categories_detailed.length > 0 && (
                    <ChevronDown className="ml-1 w-4 h-4" />
                  )}
                </Link>

                {/* Dropdown menu с вложенными подкатегориями */}
                {category.mini_categories_detailed && category.mini_categories_detailed.length > 0 && (
                  <div className="absolute top-full left-0 bg-white shadow-2xl border border-gray-200 rounded-lg min-w-72 max-w-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-3">
                    <div className="max-h-[500px] overflow-y-auto">
                      <ul className="space-y-1 px-2">
                        {category.mini_categories_detailed.map((subCategory: SubCategory, subIndex) => (
                          <li key={subIndex} className="group/sub relative">
                            {/* Подкатегория второго уровня */}
                            <div className="flex items-center">
                              <Link
                                to={`/category/${encodeURIComponent(category.category)}/${encodeURIComponent(cleanCategoryName(subCategory.name))}`}
                                className="flex-1 flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-belek-red hover:text-white transition-colors rounded-lg font-medium"
                              >
                                <span>{cleanCategoryName(subCategory.name)}</span>
                                {subCategory.subCategories && subCategory.subCategories.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs bg-gray-200 group-hover/sub:bg-white/20 px-2 py-0.5 rounded-full">
                                      {subCategory.subCategories.length}
                                    </span>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                )}
                              </Link>
                            </div>

                            {/* Вложенные подкатегории третьего уровня (выпадающее меню справа) */}
                            {subCategory.subCategories && subCategory.subCategories.length > 0 && (
                              <div className="absolute left-full top-0 ml-1 bg-white shadow-xl border border-gray-200 rounded-lg min-w-64 z-50 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 py-2">
                                <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    {cleanCategoryName(subCategory.name)}
                                  </p>
                                </div>
                                <ul className="py-2 px-2 max-h-96 overflow-y-auto">
                                  {subCategory.subCategories.map((nestedSub, nestedIndex) => (
                                    <li key={nestedIndex}>
                                      <Link
                                        to={`/category/${encodeURIComponent(category.category)}/${encodeURIComponent(cleanCategoryName(subCategory.name))}/${encodeURIComponent(cleanCategoryName(nestedSub.name))}`}
                                        className="block px-3 py-2 text-sm text-gray-600 hover:bg-belek-red hover:text-white transition-colors rounded-lg"
                                      >
                                        {cleanCategoryName(nestedSub.name)}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="container mx-auto px-4 py-2">
            <form onSubmit={handleSearch} className="mb-4 relative">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  className="input-field pr-20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-0 top-0 h-full flex items-center">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="px-2 text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div
                  ref={resultsRef}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-96 overflow-y-auto z-50"
                >
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-belek-red mx-auto"></div>
                      <p className="mt-2">Поиск...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.brand} •{" "}
                              {getCategoryName(product.category)}
                            </p>
                            <p className="text-sm font-semibold text-belek-red">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {searchQuery && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <button
                            onClick={() => {
                              navigate(
                                `/search?q=${encodeURIComponent(searchQuery)}`
                              );
                              setShowSearchResults(false);
                              setSearchQuery("");
                            }}
                            className="text-sm text-belek-red hover:underline"
                          >
                            Показать все результаты для "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </>
                  ) : searchQuery && !searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>Ничего не найдено по запросу "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </form>

            {/* Мобильные категории с вложенными подкатегориями */}
            <div className="max-h-80 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <li key={category.category}>
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/category/${encodeURIComponent(category.category)}`}
                        className="flex-1 py-3 font-medium"
                        onClick={closeMobileMenu}
                      >
                        {cleanCategoryName(category.category)}
                      </Link>
                      {category.mini_categories_detailed && category.mini_categories_detailed.length > 0 && (
                        <button
                          onClick={() => toggleMobileCategory(category.category)}
                          className="p-2 text-gray-500 hover:text-belek-red transition-colors"
                          aria-label={`Показать подкатегории для ${category.category}`}
                        >
                          {expandedMobileCategories.has(category.category) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Подкатегории второго уровня */}
                    {category.mini_categories_detailed &&
                      category.mini_categories_detailed.length > 0 &&
                      expandedMobileCategories.has(category.category) && (
                        <div className="pb-2">
                          <ul className="bg-gray-50 rounded-lg mt-2 divide-y divide-gray-200">
                            {category.mini_categories_detailed.map((subCategory: SubCategory, subIndex) => {
                              const subCategoryKey = `${category.category}-${subCategory.name}`;
                              const hasNestedSubs = subCategory.subCategories && subCategory.subCategories.length > 0;

                              return (
                                <li key={subIndex}>
                                  <div className="flex items-center justify-between">
                                    <Link
                                      to={`/category/${encodeURIComponent(category.category)}/${encodeURIComponent(cleanCategoryName(subCategory.name))}`}
                                      className="flex-1 px-4 py-2 text-sm text-gray-700 hover:text-belek-red font-medium"
                                      onClick={closeMobileMenu}
                                    >
                                      {cleanCategoryName(subCategory.name)}
                                    </Link>
                                    {hasNestedSubs && (
                                      <button
                                        onClick={() => toggleMobileSubCategory(subCategoryKey)}
                                        className="p-2 text-gray-400 hover:text-belek-red transition-colors"
                                        aria-label={`Показать подкатегории для ${subCategory.name}`}
                                      >
                                        {expandedMobileSubCategories.has(subCategoryKey) ? (
                                          <ChevronUp size={14} />
                                        ) : (
                                          <ChevronDown size={14} />
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  {/* Подкатегории третьего уровня */}
                                  {hasNestedSubs && expandedMobileSubCategories.has(subCategoryKey) && (
                                    <div className="ml-4 mt-1 mb-2">
                                      <ul className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                                        {subCategory.subCategories!.map((nestedSub, nestedIndex) => (
                                          <li key={nestedIndex}>
                                            <Link
                                              to={`/category/${encodeURIComponent(category.category)}/${encodeURIComponent(cleanCategoryName(subCategory.name))}/${encodeURIComponent(cleanCategoryName(nestedSub.name))}`}
                                              className="block px-4 py-2 text-xs text-gray-600 hover:bg-belek-red hover:text-white transition-colors"
                                              onClick={closeMobileMenu}
                                            >
                                              {cleanCategoryName(nestedSub.name)}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                  </li>
                ))}

                {/* Дополнительные ссылки */}
                <li>
                  <Link
                    to="/about"
                    className="block py-3 font-medium"
                    onClick={closeMobileMenu}
                  >
                    О компании
                  </Link>
                </li>
                <li>
                  <Link
                    to="/delivery"
                    className="block py-3 font-medium"
                    onClick={closeMobileMenu}
                  >
                    Доставка
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacts"
                    className="block py-3 font-medium"
                    onClick={closeMobileMenu}
                  >
                    Контакты
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};