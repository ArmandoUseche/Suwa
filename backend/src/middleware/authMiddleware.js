const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'suwa_secret_dev';

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuarioId = payload.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};