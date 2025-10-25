# Beltek Proxy Server

Прокси сервер для обхода CORS при работе с МойСклад API.

## Деплой на Render.com (бесплатно)

1. Зарегистрируйтесь на https://render.com
2. Нажмите "New +" → "Web Service"
3. Подключите GitHub репозиторий или загрузите код
4. Настройки:
   - **Name**: beltek-proxy
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Добавьте Environment Variables:
   - `MOYSKLAD_TOKEN` = `Bearer e66fb46aeaa51e135b6f00556916a1ffb63c9d48`

6. Нажмите "Create Web Service"

7. После деплоя получите URL типа: `https://beltek-proxy.onrender.com`

## Деплой на Railway.app (бесплатно)

1. Зарегистрируйтесь на https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Выберите репозиторий
4. Настройки:
   - Root Directory: backend
   - Start Command: `npm start`
5. Добавьте переменные окружения
6. Получите URL

## Локальный запуск

```bash
cd backend
npm install
npm start
```

Сервер запустится на http://localhost:3001

## После деплоя

1. Скопируйте URL вашего сервера (например `https://beltek-proxy.onrender.com`)
2. В фронтенде обновите `src/lib/moysklad.ts`:
   - Замените `const MOYSKLAD_API_URL = '/api/moysklad'`
   - На `const MOYSKLAD_API_URL = 'https://beltek-proxy.onrender.com/api/moysklad'`
3. Пересоберите фронтенд: `npm run build`
4. Загрузите `dist` на ваш хостинг
