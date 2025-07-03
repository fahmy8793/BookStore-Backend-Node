const express = require('express');
const { checkoutOrder } = require('../controllers/orders/checkout.controller');
const { getMyOrders, getOrderById } = require('../controllers/orders/order.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/checkout', authMiddleware, checkoutOrder);
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);


// export default router;
module.exports = router;