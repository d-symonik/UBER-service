const express = require('express');
const {
  addTruckForUser, getUsersTrucks, getUsersTruckById, updateUsersTruckById, deleteUsersTruckById,
  assignTruckToUserById,
} = require('../controllers/driverController');
const { roleMiddleware } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', roleMiddleware('DRIVER'), addTruckForUser);
router.get('/', roleMiddleware('DRIVER'), getUsersTrucks);
router.get('/:id', roleMiddleware('DRIVER'), getUsersTruckById);
router.put('/:id', roleMiddleware('DRIVER'), updateUsersTruckById);
router.delete('/:id', roleMiddleware('DRIVER'), deleteUsersTruckById);
router.post('/:id/assign', roleMiddleware('DRIVER'), assignTruckToUserById);

module.exports = {
  driverRouter: router,
};
