const express = require('express');
const router = express.Router();
const { loginManager } = require('../controllers/authController');

router.post('/login', loginManager);

module.exports = router;