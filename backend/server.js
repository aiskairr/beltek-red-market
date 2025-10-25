import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// МойСклад API credentials (из переменных окружения)
const MOYSKLAD_TOKEN = process.env.MOYSKLAD_TOKEN || 'Bearer 26c3d168f4406b10d12a792b60c0c61a8cc77c56';
const MOYSKLAD_API_URL = 'https://api.moysklad.ru/api/remap/1.2';

// Enable CORS для всех доменов
app.use(cors({
  origin: '*', // Разрешаем все домены
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Дополнительные CORS заголовки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  // Обрабатываем OPTIONS запросы
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

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
