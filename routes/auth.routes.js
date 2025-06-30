const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");

// register route
router.post('/register', register); // to use it , you must write /api/auth/register

// login route
router.post('/login', login);  // to use it , you must write /api/auth/login

module.exports = router;