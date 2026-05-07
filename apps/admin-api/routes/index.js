const express = require('express');
const router = express.Router();

router.use('/bookings', require('./booking'));
router.use('/admin', require('./admin'));
router.use('/health', require('./health'));

module.exports = router;
