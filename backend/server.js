const express = require('express');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

// Базовые роуты
app.get('/', (req, res) => {
  res.json({ message: 'Coach Platform API is running 🚀' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Роуты авторизации (все начинаются с /api/auth)
app.use('/api/auth', authRoutes);

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});