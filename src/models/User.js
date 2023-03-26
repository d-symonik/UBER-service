const mongoose = require('mongoose');
const Joi = require('joi');

const userJoiSchema = Joi.object({
  email: Joi.string()
    .email().required(),

  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/),
  role: Joi.string().valid('SHIPPER', 'DRIVER'),

});

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['SHIPPER', 'DRIVER'],
    required: true,
  },
}, { timestamps: { createdAt: 'created_date', updatedAt: false }, versionKey: false });
module.exports = {
  UserSchema: mongoose.model('User', UserSchema),
  userJoiSchema,
};
