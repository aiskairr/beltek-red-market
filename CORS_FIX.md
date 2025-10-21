# CORS Fix для MoySklad API

## 🔴 Проблема
MoySklad API не разрешает прямые запросы из браузера из-за CORS policy.

## ✅ Решение
Добавлен Vite proxy для разработки.

## 🚀 Как использовать

### 1. Перезапустите сервер разработки
```bash
# Остановите текущий сервер (Ctrl+C)
# Затем запустите снова
npm run dev
```

### 2. Проверьте
Откройте http://localhost:8080 - теперь API запросы должны работать через прокси.

## 📋 Что изменилось

### vite.config.ts
Добавлен proxy:
```typescript
proxy: {
  '/api/moysklad': {
    target: 'https://api.moysklad.ru',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/moysklad/, '/api/remap/1.2'),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Authorization', 'Bearer YOUR_TOKEN');
      });
    },
  },
}
```

### src/lib/moysklad.ts
API URL теперь использует прокси в разработке:
```typescript
const MOYSKLAD_API_URL = isDevelopment 
  ? '/api/moysklad'  // Прокси в разработке
  : 'https://api.moysklad.ru/api/remap/1.2';  // Прямой API в продакшене
```

## ⚠️ Важно для продакшена

Для продакшена нужен **backend сервер**:

### Вариант 1: Node.js Backend
Создайте простой Express сервер:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/moysklad/*', async (req, res) => {
  const path = req.path.replace('/api/moysklad', '');
  const url = `https://api.moysklad.ru/api/remap/1.2${path}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
      },
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### Вариант 2: Netlify Functions
Создайте serverless функцию:

```javascript
// netlify/functions/moysklad.js
exports.handler = async (event) => {
  const response = await fetch('https://api.moysklad.ru/api/remap/1.2/...', {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify(await response.json())
  };
};
```

### Вариант 3: Vercel API Routes
```javascript
// pages/api/moysklad/[...path].js
export default async function handler(req, res) {
  const { path } = req.query;
  const url = `https://api.moysklad.ru/api/remap/1.2/${path.join('/')}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  });
  
  const data = await response.json();
  res.status(200).json(data);
}
```

## 🔧 Альтернативное решение

Если не хотите использовать backend, можно попросить MoySklad добавить ваш домен в CORS whitelist:
1. Свяжитесь с поддержкой MoySklad
2. Попросите добавить ваш домен в CORS policy
3. Укажите домены: `http://localhost:8080`, `https://yourdomain.com`

## 📝 Примечания

- **Разработка**: Используется Vite proxy (работает автоматически)
- **Продакшен**: Нужен backend или serverless функции
- **Безопасность**: Никогда не храните API токен в frontend коде для продакшена

## ✅ Проверка

После перезапуска сервера:
1. Откройте http://localhost:8080
2. Откройте DevTools → Network
3. Проверьте что запросы идут на `/api/moysklad/...`
4. Проверьте что нет CORS ошибок

Если все работает - вы увидите данные из MoySklad!
