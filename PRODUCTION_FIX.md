# 🔧 Исправление ошибки на продакшене

## Что было исправлено

1. **Добавлена обработка ошибок** в `useMoySkladProducts.ts` - теперь API ошибки не роняют приложение
2. **Улучшено логирование** в `moysklad.ts` - видны детальные ошибки подключения
3. **Добавлен ErrorBoundary** - если что-то сломается, пользователь увидит понятное сообщение вместо белого экрана

## Шаги для деплоя исправления

### 1. Проверьте прокси-сервер на Render

Откройте в браузере: **https://beltek-red-market.onrender.com/health**

**Если НЕ открывается или долго грузится:**
- Сервер на Render "заснул" (бесплатный план)
- Первый запрос разбудит его (30-60 секунд)
- После этого приложение должно заработать

**Если возвращает ошибку:**
- Прокси сервер не работает
- Нужно передеплоить backend на Render (см. инструкцию ниже)

### 2. Пересоберите фронтенд

```bash
npm run build
```

### 3. Задеплойте на хостинг

**Если используете Netlify:**
```bash
# Загрузите папку dist на Netlify
# или через Netlify CLI:
netlify deploy --prod
```

**Если используете Vercel:**
```bash
vercel --prod
```

**Если обычный хостинг:**
- Загрузите содержимое папки `dist` на сервер через FTP/SSH

---

## Проверка после деплоя

1. Откройте сайт
2. Откройте консоль браузера (F12 → Console)
3. Вы должны увидеть логи:
   ```
   🔄 Loading ALL products from API...
   🌐 API Request: https://beltek-red-market.onrender.com/api/moysklad/entity/product?...
   📡 API Response status: 200 OK
   📦 Loaded X / Y products
   ✅ Total loaded: X products
   ```

**Если видите:**
- ❌ Network error - прокси недоступен → проверьте Render сервер
- ❌ API Error Response: 401/403 → проблема с токеном
- ❌ API Error Response: 500 → проблема на стороне МойСклад API

---

## Если Render прокси не работает

### Вариант A: Перезапустить Render сервер

1. Зайдите на https://dashboard.render.com
2. Найдите ваш Web Service `beltek-red-market`
3. Нажмите **Manual Deploy** → **Deploy latest commit**

### Вариант B: Использовать Netlify редиректы (проще!)

**Только для Netlify** (Vercel не поддерживает добавление заголовков к редиректам)

1. Измените `.env.production`:
   ```
   VITE_API_URL=/api/moysklad
   ```

2. Убедитесь что `netlify.toml` содержит:
   ```toml
   [[redirects]]
     from = "/api/moysklad/*"
     to = "https://api.moysklad.ru/api/remap/1.2/:splat"
     status = 200
     force = true
     headers = {Authorization = "Bearer e66fb46aeaa51e135b6f00556916a1ffb63c9d48"}
   ```

3. Пересоберите и задеплойте:
   ```bash
   npm run build
   netlify deploy --prod
   ```

Теперь Netlify сам будет проксировать запросы к МойСклад - **без внешнего сервера!**

---

## Дополнительная диагностика

### Проверка в Network вкладке (F12 → Network)

При загрузке страницы должен быть запрос к:
- `https://beltek-red-market.onrender.com/api/moysklad/entity/product?...`
- Или `/api/moysklad/entity/product?...` (если используете Netlify редиректы)

**Статус 200** = все ОК  
**Статус 502/504** = прокси сервер недоступен  
**Статус 401/403** = проблема с авторизацией  
**Failed (CORS error)** = неправильная CORS конфигурация  

---

## Нужна помощь?

1. Скопируйте **ВСЕ логи** из консоли браузера (F12 → Console)
2. Скопируйте ошибку из Network вкладки (если есть)
3. Укажите на какой платформе задеплоен фронтенд (Netlify/Vercel/другое)
