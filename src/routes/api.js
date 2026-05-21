const express = require('express');
const router = express.Router();
const bookingController = require('../app/controllers/BookingController');
const adminController = require('../app/controllers/AdminController');

//===== Customer facing booking ======
//user xem danh sách sự kiện
router.get('/concerts', bookingController.getConcerts);

//user đặt vé
router.post('/bookings', bookingController.createBooking);

//====== internal operation (Admin) ======
//Admin xem danh sách booking
router.get('/admin/bookings', adminController.getBookings);

//Admin cập nhật status
router.patch('/admin/bookings/:id/status', adminController.updateStatus);

module.exports = router;