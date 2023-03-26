const { truckJoiSchema, TruckSchema } = require('../models/Truck');
const { createTruck } = require('../services/truckService');
/* eslint no-underscore-dangle: 0 */
/* eslint consistent-return: 0 */
const addTruckForUser = async (req, res) => {
  try {
    const { type } = req.body;
    const { _id } = req.user;

    await truckJoiSchema.validateAsync({ type });

    await createTruck({ created_by: _id, type })
      .then(() => {
        res.status(200).json({ message: 'Truck created successfully' });
      })
      .catch((e) => {
        res.status(500).json({ message: e.message });
      });
  } catch (e) {
    return res.status(400).json({ message: 'Invalid input values' });
  }
};

const getUsersTrucks = async (req, res) => {
  try {
    return TruckSchema.find({ created_by: req.user._id })
      .then((trucks) => {
        res.status(200).json({ trucks });
      })
      .catch(() => res.status(500).json({ message: 'Internal server error' }));
  } catch (e) {
    return res.status(400).json({ message: 'Bad request' });
  }
};

const getUsersTruckById = async (req, res) => {
  try {
    const truckID = req.params.id;
    if (!truckID) {
      return res.status(400).send({ message: 'Incorrect ID' });
    }
    const truck = await TruckSchema.findById(truckID);
    if (!truck) {
      return res.status(400).send({ message: 'Truck with this ID doesn`t exist' });
    }
    if (truck.created_by !== req.user._id) {
      return res.status(400).send({ message: 'Oops, that`s not your truck' });
    }
    return TruckSchema.findById(truckID).then((result) => {
      res.status(200).json({ truck: result });
    })
      .catch(() => {
        res.status(500).send({ message: 'Internal server error' });
      });
  } catch (e) {
    return res.status(400).json({ message: 'Bad request' });
  }
};

const updateUsersTruckById = async (req, res) => {
  try {
    const truckID = req.params.id;
    const { type } = req.body;

    await truckJoiSchema.validateAsync({ type });

    if (!truckID) {
      return res.status(400).send({ message: 'Incorrect ID' });
    }

    const truck = await TruckSchema.findById(truckID);

    if (!truck) {
      return res.status(400).send({ message: 'Truck with this ID doesn`t exist' });
    }

    if (truck.created_by !== req.user._id) {
      return res.status(400).send({ message: 'Oops, that`s not your truck' });
    }
    if (truck.assigned_to) {
      return res.status(400).send({ message: 'You can`t update this truck' });
    }
    if (truck.type === type) {
      return res.status(400).send({ message: 'Values are the same. Try again' });
    }

    await TruckSchema.findByIdAndUpdate(truckID, { type }).then(() => {
      res.status(200).json({
        message: 'Truck details changed successfully',
      });
    })
      .catch(() => {
        res.status(500).send({ message: 'Internal server error' });
      });
  } catch (e) {
    return res.status(400).json({ message: 'Invalid input values' });
  }
};

const deleteUsersTruckById = async (req, res) => {
  try {
    const truckID = req.params.id;

    if (!truckID) {
      return res.status(400).send({ message: 'Incorrect ID' });
    }

    const truck = await TruckSchema.findById(truckID);
    if (truck.created_by !== req.user._id) {
      return res.status(400).send({ message: 'Oops, that`s not your truck' });
    }
    if (!truck) {
      return res.status(400).send({ message: 'Truck with this ID doesn`t exist' });
    }
    if (truck.assigned_to) {
      return res.status(400).send({ message: 'You can`t update this truck' });
    }

    await TruckSchema.findByIdAndDelete(truckID).then(() => {
      res.status(200).json({
        message: 'Truck deleted successfully',
      });
    })
      .catch(() => {
        res.status(500).send({ message: 'Internal server error' });
      });
  } catch (e) {
    return res.status(400).json({ message: 'Invalid input values' });
  }
};

const assignTruckToUserById = async (req, res) => {
  try {
    const truckID = req.params.id;

    if (!truckID) {
      return res.status(400).send({ message: 'Incorrect ID' });
    }

    const truck = await TruckSchema.findById(truckID);
    if (truck.created_by !== req.user._id) {
      return res.status(400).send({ message: 'Oops, that`s not your truck' });
    }
    if (!truck) {
      return res.status(400).send({ message: 'Truck with this ID doesn`t exist' });
    }
    const listOfTheTrucks = await TruckSchema.find({ assigned_to: { $ne: null } });
    if (listOfTheTrucks.length !== 0) {
      return res.status(400).send({ message: 'You can`t assign another one truck' });
    }

    await TruckSchema.findByIdAndUpdate(truckID, { assigned_to: req.user._id }).then(() => {
      res.status(200).json({
        message: 'Truck assigned successfully',
      });
    })
      .catch(() => {
        res.status(500).send({ message: 'Internal server error' });
      });
  } catch (e) {
    return res.status(400).json({ message: 'Invalid input values' });
  }
};

module.exports = {
  addTruckForUser,
  getUsersTrucks,
  getUsersTruckById,
  updateUsersTruckById,
  deleteUsersTruckById,
  assignTruckToUserById,
};
