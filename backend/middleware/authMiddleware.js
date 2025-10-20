const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Acesso não autorizado' });
  }

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Coloca o usuário no objeto req para ser usado nas rotas protegidas
    req.user = await User.findByPk(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Acesso não autorizado' });
  }
};