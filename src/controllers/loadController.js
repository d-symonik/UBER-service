const { loadJoiSchema, LoadSchema, loadJoi } = require('../models/Load');
const { createLoad } = require('../services/loadServices');
const { TruckSchema } = require('../models/Truck');
/* eslint no-underscore-dangle: 0 */
/* eslint consistent-return: 0 */
/* eslint camelcase: 0 */
const addLoads = async (req, res) => {
  try {
    const {
      name, payload, pickup_address, delivery_address, dimensions,
    } = req.body;
    await loadJoiSchema.validateAsync({
      name, payload, pickup_address, delivery_address, dimensions,
    });
    const created_by = req.user._id;
    await createLoad({
      created_by, name, payload, pickup_address, delivery_address, dimensions,
    })
      .then(() => res.json({ message: 'Load created successfully' }))
      .catch((e) => res.status(500).json(e.message));
  } catch (e) {
    return res.status(400).json({ message: 'Invalid input values' });
  }
};

const postLoadById = async (req, res) => {
  try {
    const loadId = req.params.id;

    if (!loadId) {
      return res.status(400).send({ message: 'Bad request' });
    }
    const load = await LoadSchema.findById(loadId);

    if (!load) {
      return res.status(400).send({ message: 'Bad request' });
    }

    await LoadSchema.findByIdAndUpdate(loadId, { status: 'POSTED' })
      .catch(() => res.status(500).json({ message: 'Internal server error' }));
    const { width, length, height } = load.dimensions;

    let typeOfTheTruck = 'a';

    if (width <= 300
            && height <= 250
            && length <= 170
            && load.payload <= 1700) {
      typeOfTheTruck = 'SPRINTER';
    } else if (
      width <= 500
            && height <= 250
            && length <= 170
            && load.payload <= 2500) {
      typeOfTheTruck = 'SMALL STRAIGHT';
    } else if (
      width <= 700
            && height <= 350
            && length <= 200
            && load.payload <= 4000) {
      typeOfTheTruck = 'LARGE STRAIGHT';
    }

    const listOfAvailableTrucks = await TruckSchema.aggregate([
      {
        $match: {
          assigned_to: {
            $ne: null,
          },
          status: 'IS',
          type: String(typeOfTheTruck),
        },
      },
    ]);
    if (listOfAvailableTrucks.length === 0) {
      await LoadSchema.findByIdAndUpdate(loadId, {
        status: 'NEW',
        logs: { message: 'Have not available trucks', time: Date.now() },
      })
        .catch(() => res.status(500).json({ message: 'Internal server error' }));
      return res.status(400).json({ message: 'Have not available trucks' });
    }
    const availableTruck = listOfAvailableTrucks[0];
    const truckId = availableTruck._id;

    await TruckSchema
      .findByIdAndUpdate(truckId, {
        status: 'OL',
      })
      .catch(() => res.status(500).json({ message: 'Internal server error' }));
    await LoadSchema
      .findByIdAndUpdate(loadId, {
        assigned_to: availableTruck.assigned_to,
        status: 'ASSIGNED',
        state: 'En route to Pick Up',
        logs: {
          message: `Load assigned to driver with id ${availableTruck.assigned_to}`,
          time: Date.now(),
        },
      }).then(() => res.json({
        message: 'Load posted successfully',
        driver_found: true,
      })).catch(() => res.status(500).json({ message: 'Internal server error' }));
  } catch (e) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getUserActiveLoad = async (req, res) => {
   const id = req.user._id;

    const result = await LoadSchema.findOne({
        assigned_to: id,
        status: {
            $ne: 'SHIPPED',
        }
    }).catch(() => res.status(500).json({message: 'Internal server error'}));
    if(!result){
        return res.status(500).json({message: 'Internal server error'});
    }
   res.json({load:result});
};

const iterateToNextLoadState = async (req, res) => {
  const states = ['En route to Pick Up', 'Arrived to Pick Up', 'En route to delivery', 'Arrived to delivery'];
  const activeLoad = await LoadSchema.findOne({ assigned_to: req.user._id });
  const currentState = activeLoad.state;

  const currentStateIndex = states.indexOf(currentState);

  if (currentStateIndex === 3) {
    return res.status(400).json({ message: 'string' });
  }
  activeLoad.state = states[currentStateIndex + 1];

  activeLoad.logs.push({ message: `Load state changed to '${activeLoad.state}'`, time: Date.now() });

  if (activeLoad.state === 'Arrived to delivery') {
    activeLoad.status = 'SHIPPED';

    await TruckSchema.findOneAndUpdate({
      assigned_to: req.user._id,
    }, {
      status: 'IS',
      assigned_to: null,
    })
      .catch(() => res.status(500).json({ message: 'Internal server error' }));
    await activeLoad.save().then(() => {
      res.json({ message: `Load state changed to '${activeLoad.state}'` });
    }).catch(() => res.status(500).json({ message: 'Internal server error' }));
  } else {
    await activeLoad.save()
      .then(() => {
        res.json({ message: `Load state changed to '${activeLoad.state}'` });
      })
      .catch(() => res.status(500).json({ message: 'Internal server error' }));
  }
};

const getUsersLoadById = async (req, res) => {
  await LoadSchema.findById(req.params.id).then((result) => res.json({ load: result })).catch(() => res.status(500).json({ message: 'Internal server error' }));
};

const getUsersLoads = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const offset = +req.query.offset || 0;

    /*if (Number.isNaN(+req.query.limit)) {
      return res.status(400).json({ message: 'Please, input number as limit param' });
    }
    const limit = (+req.query.limit >= 10 && +req.query.limit <= 50) ? +req.query.limit : 10;*/
    let status;
    if (req.query.status) {
      status = [req.query.status.toString().toUpperCase()];
      if ((!['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'].includes(status[0])) && status[0]) {
        return res.status(400).json({ message: 'Please, input correct value as filter param' });
      }
    } else {
      status = ['NEW', 'POSTED', 'ASSIGNED', 'SHIPPED'];
    }

    if (role === 'DRIVER') {
      await LoadSchema.aggregate([
        {
          $match: {
            status,
            //assigned_to: _id,
          },
        }, /*{

        },*/ {
          $skip: offset,
        },
      ]).then((loads) => res.status(200).json({ loads })).catch(() => res.status(500).json({ message: 'Internal server error' }));
    }
    if (role === 'SHIPPER') {
      await LoadSchema.aggregate([
        {
          $match: {
            status: { $in: status },
            //assigned_to: _id,
          },
        },/* {
          $limit: limit,
        },*/ {
          $skip: offset,
        },
      ]).then((loads) => res.status(200).json({ loads })).catch(() => res.status(500).json({ message: 'Internal server error' }));
    }
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const updateUsersLoadById = async (req, res) => {
  try {
    const loadId = req.params.id;
    const load = await LoadSchema.findById(loadId);
    if (load.status !== 'NEW') {
      return res.status(400).json({ message: 'Bad request' });
    }
    await loadJoi.validateAsync(req.body);
    if (req.user._id !== load.created_by) {
      return res.status(400).json({ message: 'Bad request' });
    }
    await LoadSchema.findByIdAndUpdate(loadId, req.body).then(() => res.json({ message: 'Load details changed successfully' })).catch(() => res.status(500).json({ message: 'Internal server error' }));
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

const deleteUsersLoadById = async (req, res) => {
  try {
    const loadId = req.params.id;
    const load = await LoadSchema.findById(loadId);
    if (load.status !== 'NEW') {
      return res.status(400).json({ message: 'Bad request' });
    }
    if (req.user._id !== load.created_by) {
      return res.status(400).json({ message: 'Bad request' });
    }
    await LoadSchema.findByIdAndDelete(loadId).then(() => res.json({ message: 'Load deleted successfully' })).catch(() => res.status(500).json({ message: 'Internal server error' }));
  } catch (e) {
    return res.status(400).json({ message: 'Bad request' });
  }
};

const getUserLoadShippingInfoById = async (req, res) => {
  try {
    const loadId = req.params.id;
    const load = await LoadSchema.findById(loadId).catch(() => res.status(500).json({ message: 'Internal server error' }));
    if (load.status === 'NEW') {
      return res.status(400).json({ message: 'Bad request' });
    }
    const loadsTruck = await TruckSchema.findOne({ assigned_to: load.assigned_to }).catch(() => res.status(500).json({ message: 'Internal server error' }));
    res.json({ load, truck: loadsTruck });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

module.exports = {
  addLoads,
  postLoadById,
  getUserActiveLoad,
  iterateToNextLoadState,
  getUsersLoadById,
  getUsersLoads,
  updateUsersLoadById,
  deleteUsersLoadById,
  getUserLoadShippingInfoById,
};
