const express = require('express');
const { registerAdmin, login } = require('../controllers/adminControllers');
const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', login);

module.exports = router;
