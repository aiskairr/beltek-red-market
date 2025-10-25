# 🚀 Настройка Render для статического хостинга

## Текущая ситуация
- ✅ У вас уже есть сервис на Render: `beltek-red-market`
- ✅ Backend код готов в папке `backend/`
- ❌ Нужно настроить переменную окружения правильно

---

## Шаг 1: Настройка на Render.com

### 1.1 Проверьте настройки сервиса

Зайдите в ваш сервис на Render: https://dashboard.render.com/

**Environment Variables** должны быть:
- **Key**: `MOYSKLAD_TOKEN`
- **Value**: `Bearer 26c3d168f4406b10d12a792b60c0c61a8cc77c56`

⚠️ **ВАЖНО**: На скриншоте видно что у вас переменная называется просто `Bearer` - нужно переименовать в `MOYSKLAD_TOKEN`!

### 1.2 Настройки сервиса должны быть:

- **Name**: beltek-red-market
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 1.3 Проверьте URL сервиса

После деплоя ваш URL должен быть примерно:
```
https://beltek-red-market.onrender.com
```

Проверьте что сервис работает, открыв:
```
https://beltek-red-market.onrender.com/health
```

Должен вернуть: `{"status":"OK","message":"Proxy server is running"}`

---

## Шаг 2: Сборка фронтенда

### 2.1 Убедитесь что `.env.production` правильный

Файл уже обновлен:
```env
VITE_API_URL=https://beltek-red-market.onrender.com/api/moysklad
```

⚠️ Если URL вашего Render сервиса другой - измените в этом файле!

### 2.2 Соберите проект для production

```bash
npm run build
```

Это создаст папку `dist/` с готовым приложением.

---

## Шаг 3: Загрузка через FileZilla

1. Откройте FileZilla
2. Подключитесь к вашему хостингу
3. Удалите все старые файлы в корневой директории сайта
4. Загрузите **содержимое** папки `dist/` (не саму папку!)
   - index.html
   - assets/
   - vite.svg
   - и другие файлы

⚠️ **Важно**: Загружайте содержимое папки dist, а не саму папку!

---

## Шаг 4: Проверка

1. Откройте ваш сайт в браузере
2. Откройте DevTools (F12) → Network
3. При загрузке каталога должны идти запросы к:
   ```
   https://beltek-red-market.onrender.com/api/moysklad/...
   ```
4. ✅ Не должно быть CORS ошибок!

---

## Решение проблем

### ❌ Все равно CORS ошибки

1. Проверьте что Render сервис запущен (зайдите на /health)
2. Проверьте URL в браузере (F12 → Network) - должен идти на Render
3. Проверьте что переменная `MOYSKLAD_TOKEN` установлена на Render

### ⏳ Render сервер "спит"

- Бесплатный план Render засыпает после 15 минут неактивности
- Первый запрос будет медленным (30-60 секунд)
- Последующие запросы быстрые

### 🔄 Нужно обновить код backend

Если вы обновили файлы в `backend/`:
1. Закоммитьте изменения в Git
2. Запушьте на GitHub
3. Render автоматически пересоберет и задеплоит

Или вручную:
1. Зайдите на Render Dashboard
2. Найдите ваш сервис
3. Нажмите "Manual Deploy" → "Deploy latest commit"

---

## Быстрая проверка через curl

Проверьте что прокси работает:

```bash
curl https://beltek-red-market.onrender.com/health
```

Должен вернуть:
```json
{"status":"OK","message":"Proxy server is running"}
```

Проверьте запрос к API:
```bash
curl https://beltek-red-market.onrender.com/api/moysklad/entity/product?limit=1
```

Должен вернуть данные о товарах из МойСклад.

---

## Контрольный чеклист

- [ ] Render сервис запущен и доступен
- [ ] Переменная `MOYSKLAD_TOKEN` установлена правильно
- [ ] `/health` возвращает OK
- [ ] `.env.production` содержит правильный URL Render
- [ ] Проект собран через `npm run build`
- [ ] Содержимое `dist/` загружено на хостинг через FileZilla
- [ ] Сайт открывается без CORS ошибок

---

## Нужна помощь?

Пришлите скриншоты:
1. Render Dashboard → Environment Variables
2. Браузер F12 → Network (с CORS ошибкой если есть)
3. Render Logs (если сервис не работает)
