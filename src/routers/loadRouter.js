const express = require('express');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const {
  addLoads, postLoadById, iterateToNextLoadState, getUserActiveLoad, getUsersLoadById,
  getUsersLoads, updateUsersLoadById, deleteUsersLoadById, getUserLoadShippingInfoById,
} = require('../controllers/loadController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', roleMiddleware('SHIPPER'), addLoads);
router.post('/:id/post', roleMiddleware('SHIPPER'), postLoadById);
router.patch('/active/state', roleMiddleware('DRIVER'), iterateToNextLoadState);
router.get('/active', roleMiddleware('DRIVER'), getUserActiveLoad);
router.get('/:id', authMiddleware, getUsersLoadById);
router.get('/', authMiddleware, getUsersLoads);
router.put('/:id', roleMiddleware('SHIPPER'), updateUsersLoadById);
router.delete('/:id', roleMiddleware('SHIPPER'), deleteUsersLoadById);
router.get('/:id/shipping_info', roleMiddleware('SHIPPER'), getUserLoadShippingInfoById);
module.exports = {
  loadRouter: router,
};
