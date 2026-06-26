function adminCheck(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ mesaj: 'Acces interzis. Doar admin.' });
  }

  next();
}

module.exports = adminCheck;
