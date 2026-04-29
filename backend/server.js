require('dotenv').config();

const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const moduleRoutes = require('./src/routes/moduleRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const assignmentRoutes = require('./src/routes/assignmentRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Coach Platform API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assignments', assignmentRoutes);

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
