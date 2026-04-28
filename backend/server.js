// Подключаем Express — библиотеку для создания веб-сервера
const express = require('express');

// Создаём экземпляр приложения
const app = express();

// Указываем порт, на котором будет работать сервер
const PORT = 3000;

// Middleware — позволяет серверу понимать JSON в запросах
app.use(express.json());

// Первый роут (endpoint): когда кто-то заходит на главную страницу — отвечаем
app.get('/', (req, res) => {
  res.json({ message: 'Coach Platform API is running 🚀' });
});

// Второй роут — проверка работоспособности
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});