const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
const { userJoiSchema, UserSchema } = require('../models/User');
const { createUser } = require('../services/authServices');
/* eslint no-underscore-dangle: 0 */
/* eslint consistent-return: 0 */
dotenv.config();
const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    await userJoiSchema.validateAsync({ email, password, role });

    const candidate = await UserSchema.findOne({ email });
    if (candidate) {
      return res.status(400).json({ message: 'string' });
    }

    await createUser({ email, password, role })
      .then(() => {
        res.status(200).json({ message: 'Profile created successfully' });
      })
      .catch(() => {
        res.status(500).json({ message: 'string' });
      });
  } catch (e) {
    return res.status(400).json({ message: 'string' });
  }
};
const loginUser = async (req, res) => {
  const { email } = req.body;

  const user = await UserSchema.findOne({ email });

  if (user && await bcryptjs.compare(String(req.body.password), String(user.password))) {
    const payload = {
      userId: user._id, email: user.email, role: user.role, created_date: user.created_date,
    };
    const jwtToken = jwt.sign(payload, '123');
    if (!jwtToken) {
      return res.status(500).json({ message: 'string' });
    }
    return res.status(200).send({ jwt_token: jwtToken });
  }

  return res.status(400).json({ message: 'Not authorized' });
};

const recoveryPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userJoiSchema.validateAsync({ email });
    const user = await UserSchema.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User with such email does not exist' });
    }
    const newPassword = Math.random().toString(36).slice(-8);
    console.log(newPassword);
    const newHashedPassword = await bcryptjs.hash(newPassword, 10);

    await UserSchema.updateOne({ email }, { password: newHashedPassword })
      .then(() => {
        res.status(200).json({ message: 'New password sent to your email address' });
      })
      .catch(() => {
        res.status(500).json({ message: 'string' });
      });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};
module.exports = {
  registerUser,
  loginUser,
  recoveryPassword,
};
