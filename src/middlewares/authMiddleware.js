const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const authMiddleware = (req, res, next) => {
  const {
    authorization,
  } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Please, provide authorization header' });
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    return res.status(401).json({ message: 'Please, include token to request' });
  }

  try {
    const tokenPayload = jwt.verify(token, '123');
    req.user = {
      _id: tokenPayload.userId,
      role: tokenPayload.role,
      email: tokenPayload.email,
      created_date: tokenPayload.created_date,
    };

    next();
    return true;
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

module.exports = {
  authMiddleware,
};
