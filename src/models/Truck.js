const mongoose = require('mongoose');
const Joi = require('joi');

const truckJoiSchema = Joi.object({
  type: Joi.string().valid('SPRINTER', 'SMALL STRAIGHT', 'LARGE STRAIGHT'),
  status: Joi.string().valid('IS', 'OL'),

});
const TruckSchema = mongoose.Schema({
  created_by: {
    type: String,
    required: true,

  },
  assigned_to: {
    type: String,
    default: null,

  },
  type: {
    type: String,
    enum: ['SPRINTER', 'SMALL STRAIGHT', 'LARGE STRAIGHT'],

    required: true,
  },
  status: {
    type: String,
    enum: ['IS', 'OL'],
    default: 'IS',
    required: true,
  },
}, { timestamps: { createdAt: 'created_date', updatedAt: false }, versionKey: false });
module.exports = {
  TruckSchema: mongoose.model('Truck', TruckSchema),
  truckJoiSchema,

};
