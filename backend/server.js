import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// МойСклад API credentials
const MOYSKLAD_TOKEN = 'Bearer 3df691b112eee7a9e14a124222ff313ed0e7d646';
const MOYSKLAD_API_URL = 'https://api.moysklad.ru/api/remap/1.2';

// Enable CORS для всех доменов (или укажите свой домен)
app.use(cors({
  origin: '*', // В продакшене замените на ваш домен: 'https://yourdomain.com'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server is running' });
});

// Прокси все запросы к МойСклад API
app.all('/api/moysklad/*', async (req, res) => {
  try {
    // Извлекаем путь после /api/moysklad/
    const apiPath = req.path.replace('/api/moysklad/', '');
    const url = `${MOYSKLAD_API_URL}/${apiPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
    
    console.log(`Proxying request: ${req.method} ${url}`);
    
    // Делаем запрос к МойСклад API
    const response = await axios({
      method: req.method,
      url: url,
      headers: {
        'Authorization': MOYSKLAD_TOKEN,
        'Content-Type': 'application/json',
      },
      data: req.body,
      validateStatus: () => true, // Принимаем любой статус
    });
    
    // Возвращаем ответ клиенту
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      details: error.response?.data 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on port ${PORT}`);
  console.log(`📡 Proxying requests to: ${MOYSKLAD_API_URL}`);
});
