const express = require('express');
const { getDashboardStats } = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/dashboard', authMiddleware, isAdmin, getDashboardStats);

module.exports = router;