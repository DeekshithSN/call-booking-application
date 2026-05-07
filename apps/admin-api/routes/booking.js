const express = require ('express');
const { updateBooking, getBookings, getBookingImage } = require('../controllers/bookingControllers');
const router = express.Router();

router.patch('/:id', updateBooking)
router.get('/', getBookings)
router.get('/:id', getBookingImage)

module.exports = router;
