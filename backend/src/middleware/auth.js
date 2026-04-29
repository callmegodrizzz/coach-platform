const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: проверяет JWT-токен из заголовка Authorization
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // Ожидаем заголовок вида "Authorization: Bearer eyJhbGc..."
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // убираем "Bearer "

    // Проверяем подпись и срок действия
    const decoded = jwt.verify(token, JWT_SECRET);

    // Кладём данные юзера в req — следующий контроллер их получит
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next(); // пропускаем дальше
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
