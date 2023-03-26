const bcryptjs = require('bcryptjs');
const { UserSchema } = require('../models/User');

const createUser = async ({ email, password, role }) => {
  const user = new UserSchema({
    email,
    password: await bcryptjs.hash(password, 10),
    role,
  });

  return user.save();
};

module.exports = {
  createUser,
};
