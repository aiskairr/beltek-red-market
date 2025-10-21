# Отладка категорий и товаров

## Проблема
Не видно товаров и подкатегорий на странице категории.

## Что исправлено

### 1. Фильтрация категорий
Теперь фильтрация происходит на клиенте (client-side), потому что MoySklad API сложно фильтрует по `pathName`.

### 2. Увеличен лимит загрузки
Изменен `DEFAULT_PAGE_SIZE` с 50 на 100 товаров.

## Как проверить

### 1. Перезапустите сервер
```bash
# Остановите (Ctrl+C)
npm run dev
```

### 2. Откройте консоль браузера
1. Откройте DevTools (F12)
2. Перейдите на вкладку Console
3. Откройте страницу категории

### 3. Проверьте данные

Добавьте временно в `Category.tsx` после строки 93:

```typescript
// После: const products = useMemo(() => {
console.log('=== DEBUG CATEGORY ===');
console.log('Current category:', currentCategory);
console.log('Category slug:', categorySlug);
console.log('Sub-category slug:', subCategorySlug);
console.log('Product filters:', productFilters);
console.log('Products data:', productsData);
console.log('Products count:', products.length);
console.log('Sub-categories:', subCategories);
console.log('======================');
```

### 4. Проверьте структуру данных в MoySklad

Откройте в браузере:
```
http://localhost:8080/api/moysklad/entity/product?limit=5
```

Проверьте что у товаров есть:
- `pathName` - например: "1. Отдельно стоящая техника/Стиральные машины"
- `name` - название товара
- `salePrices` - цена

### 5. Проверьте категории

Откройте:
```
http://localhost:8080/api/moysklad/entity/productfolder?limit=10
```

Должны быть папки с:
- `name` - название категории
- `pathName` - путь категории

## Возможные проблемы

### Проблема 1: Нет товаров
**Причина**: В MoySklad нет товаров или они архивированы

**Решение**:
1. Проверьте что в MoySklad есть активные товары
2. Проверьте что `archived: false`

### Проблема 2: Нет подкатегорий
**Причина**: У категории нет `mini_categories`

**Решение**:
1. В MoySklad создайте вложенные папки
2. Убедитесь что `pathName` имеет формат: "Категория/Подкатегория"

### Проблема 3: Категории не совпадают
**Причина**: Названия категорий в URL и в MoySklad разные

**Решение**:
1. Проверьте точное название категории в MoySklad
2. URL должен быть: `/category/Точное%20название%20категории`

## Пример правильной структуры

### MoySklad ProductFolder
```json
{
  "name": "1. Отдельно стоящая техника",
  "pathName": "1. Отдельно стоящая техника"
}
```

### MoySklad ProductFolder (подкатегория)
```json
{
  "name": "Стиральные машины",
  "pathName": "1. Отдельно стоящая техника/Стиральные машины",
  "productFolder": {
    "meta": {
      "href": "...ссылка на родительскую папку..."
    }
  }
}
```

### MoySklad Product
```json
{
  "name": "Стиральная машина HITACHI",
  "pathName": "1. Отдельно стоящая техника/Стиральные машины",
  "salePrices": [{
    "value": 4100000
  }],
  "archived": false
}
```

## Быстрая проверка

Выполните в консоли браузера на странице категории:

```javascript
// Проверить категории
console.log('Categories:', window.categoriesData);

// Проверить товары
console.log('Products:', window.productsData);
```

## Если ничего не помогает

1. Очистите кеш браузера (Ctrl+Shift+Del)
2. Перезапустите сервер
3. Проверьте что нет CORS ошибок в консоли
4. Проверьте что API токен правильный

## Контакты для помощи

Если проблема не решается, предоставьте:
1. Скриншот консоли браузера
2. URL категории которую открываете
3. Пример данных из MoySklad API
