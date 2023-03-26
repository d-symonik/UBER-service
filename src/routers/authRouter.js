const express = require('express');

const router = express.Router();
const { registerUser, loginUser, recoveryPassword } = require('../controllers/authController');

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/forgot_password', recoveryPassword);

module.exports = {
  authRouter: router,
};
