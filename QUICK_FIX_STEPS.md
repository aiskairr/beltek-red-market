# ⚡ Быстрое исправление - 3 шага

## ЧТО ИСПРАВЛЕНО
- ✅ Добавлена обработка ошибок API
- ✅ Улучшено логирование для диагностики
- ✅ ErrorBoundary предотвращает падение приложения
- ✅ Проект собран (папка `dist` готова)

---

## ШАГ 1: Проверьте Render прокси

Откройте: **https://beltek-red-market.onrender.com/health**

**Если открывается** → Переходите к шагу 2  
**Если НЕ открывается** → Прокси "заснул", подождите 30-60 сек и обновите

---

## ШАГ 2: Задеплойте обновленный код

### Если у вас Netlify:
```bash
netlify deploy --prod
# или загрузите папку dist через веб-интерфейс
```

### Если у вас Vercel:
```bash
vercel --prod
```

### Если обычный хостинг:
- Загрузите содержимое папки `dist` через FTP/SSH

---

## ШАГ 3: Проверьте результат

1. Откройте ваш сайт
2. Нажмите F12 → Console
3. Обновите страницу (Ctrl+R / Cmd+R)

**Ожидаемые логи:**
```
🔄 Loading ALL products from API...
🌐 API Request: https://beltek-red-market.onrender.com/api/moysklad/...
📡 API Response status: 200 OK
✅ Total loaded: X products
```

**Если видите ошибки:**
- Скопируйте ВСЕ из Console
- Проверьте вкладку Network (F12 → Network)
- Смотрите детальную инструкцию в PRODUCTION_FIX.md

---

## АЛЬТЕРНАТИВА: Без внешнего прокси (только Netlify)

Если Render постоянно засыпает:

1. Измените `.env.production`:
   ```
   VITE_API_URL=/api/moysklad
   ```

2. Пересоберите:
   ```bash
   npm run build
   netlify deploy --prod
   ```

Netlify сам будет проксировать через `netlify.toml` редиректы!
