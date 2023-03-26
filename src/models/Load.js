const mongoose = require('mongoose');
const Joi = require('joi');

const loadJoiSchema = Joi.object({

  name: Joi
    .string()
    .required(),
  payload: Joi
    .number()
    .min(0)
    .required(),
  pickup_address: Joi
    .string()
    .required(),
  delivery_address: Joi
    .string()
    .required(),
  dimensions: Joi.object({
    width: Joi
      .number()
      .min(0)
      .required(),
    length: Joi
      .number()
      .min(0)
      .required(),
    height: Joi
      .number()
      .min(0)
      .required(),
  })
    .required(),

});

const loadJoi = Joi.object({

  name: Joi
    .string(),

  payload: Joi
    .number()
    .min(0),

  pickup_address: Joi
    .string(),
  delivery_address: Joi
    .string(),
  dimensions: Joi.object({
    width: Joi
      .number()
      .min(0),
    length: Joi
      .number()
      .min(0),
    height: Joi
      .number()
      .min(0)
    ,
  }),

});
const LoadSchema = mongoose.Schema({
  created_by: {
    type: String,
    required: true,

  },
  assigned_to: {
    type: String,
    default: null,

  },
  status: {
    type: String,
    enum: ['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'],
    default: 'NEW',
    required: true,
  },
  state: {
    type: String,
    enum: ['En route to Pick Up', 'Arrived to Pick Up', 'En route to delivery', 'Arrived to delivery'],

  },
  name: {
    type: String,
    required: true,
  },
  payload: {
    type: Number,
    required: true,
  },
  pickup_address: {
    type: String,
    required: true,
  },
  delivery_address: {
    type: String,
    required: true,
  },
  dimensions: {
    width: { type: Number, required: true },
    length: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  logs: [{
    message: { type: String, default: 'Load created successfully' },
    time: { type: Date, default: Date.now() },
  }],

}, { timestamps: { createdAt: 'created_date', updatedAt: false }, versionKey: false });
module.exports = {
  LoadSchema: mongoose.model('Load', LoadSchema),
  loadJoiSchema,
  loadJoi,
};
