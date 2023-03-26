const express = require('express');
const { getUserInfo, deleteUser, changePassword } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getUserInfo);

router.delete('/', authMiddleware, deleteUser);

router.patch('/password', authMiddleware, changePassword);

module.exports = {
  userRouter: router,
};
