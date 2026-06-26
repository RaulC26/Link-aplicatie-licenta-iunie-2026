  const jwt = require('jsonwebtoken');

  function verifyToken(req, res, next) {

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ mesaj: 'Acces interzis. Nu ești autentificat.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ mesaj: 'Tokenul lipsește. Autentifică-te din nou.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      next();

    } catch (error) {
      return res.status(401).json({ mesaj: 'Tokenul este invalid sau expirat. Autentifică-te din nou.' });
    }
  }

  module.exports = verifyToken;
