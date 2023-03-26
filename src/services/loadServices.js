const { LoadSchema } = require('../models/Load');
/* eslint camelcase: 0 */

const createLoad = async ({
  created_by, name, payload, pickup_address, delivery_address, dimensions,
}) => {
  const load = new LoadSchema({
    created_by,
    name,
    payload,
    pickup_address,
    delivery_address,
    dimensions,
  });

  return load.save();
};

module.exports = {
  createLoad,
};
