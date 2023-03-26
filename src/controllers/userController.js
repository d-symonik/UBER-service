const bcryptjs = require('bcryptjs');
const { UserSchema } = require('../models/User');
/* eslint no-underscore-dangle: 0 */
/* eslint consistent-return: 0 */
const getUserInfo = async (req, res) => {
  if (!req.user) res.status(500).end({ message: 'Internal server error' });
  /* if(!res.json({user:req.user}))  res.status(400).end({ 'message': 'Bad request'}) */
  return res.json({ user: req.user });
};
const deleteUser = async (req, res) => {
  if (!req.user._id) {
    return res.status(400).send({ message: 'Bad request' });
  }
  if (req.user.role === 'DRIVER') {
    return res.status(400).send({ message: 'You can`t delete this account' });
  }
  await UserSchema.findByIdAndDelete(req.user._id)
    .then(() => {
      res.status(200).send({ message: 'Profile deleted successfully' });
    }).catch(() => {
      res.status(500).send({ message: 'Internal server error' });
    });
};
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await UserSchema.findById(req.user._id);
  const hashPassword = await bcryptjs.hash(newPassword, 10);

  if (await bcryptjs.compare(oldPassword, user.password)) {
    await UserSchema.findByIdAndUpdate(req.user._id, { password: hashPassword })
      .then(() => {
        res.status(200).send({ message: 'Password changed successfully' });
      })
      .catch(() => {
        res.status(500).send({ message: 'Internal server error' });
      });
  } else {
    return res.status(400).send({ message: 'Bad request' });
  }
};
module.exports = {
  getUserInfo,
  deleteUser,
  changePassword,

};
