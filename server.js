import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy для МойСклад API
app.use('/api/moysklad', createProxyMiddleware({
  target: 'https://api.moysklad.ru',
  changeOrigin: true,
  pathRewrite: {
    '^/api/moysklad': '/api/remap/1.2',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Добавляем авторизацию
    proxyReq.setHeader('Authorization', 'Bearer 3df691b112eee7a9e14a124222ff313ed0e7d646');
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Отдаем статические файлы из dist
app.use(express.static(path.join(__dirname, 'dist')));

// Все остальные маршруты отправляем на index.html (для React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
