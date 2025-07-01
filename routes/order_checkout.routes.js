const express = require('express');
const { checkoutOrder } = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/checkout', authMiddleware, checkoutOrder);

export default router;