const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createPaypalOrder, capturePayPalOrder } = require('../controllers/paypal.controller');

// POST /api/paypal/create-order
router.post('/create-order', authMiddleware, createPaypalOrder);

// POST /api/paypal/capture-order
router.post('/capture-order', authMiddleware, capturePayPalOrder);


module.exports = router;
