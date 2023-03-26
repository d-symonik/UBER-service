const { TruckSchema } = require('../models/Truck');
/* eslint camelcase: 0 */

const createTruck = async ({ created_by, type }) => {
  const truck = new TruckSchema({
    created_by,
    type,
  });

  return truck.save();
};

module.exports = {
  createTruck,
};
