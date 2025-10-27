// Bookings routes - /dashboard must be before any /:id or parameterized routes!
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Get dashboard data (must be before /:id route)
router.get('/dashboard', authMiddleware.verifyToken, bookingController.getDashboardData);

// Create a new booking
router.post('/', authMiddleware.verifyToken, bookingController.createBooking);

// Get all bookings (admin)
router.get('/', authMiddleware.verifyToken, bookingController.getAllBookings);

// Get all bookings for a user
router.get('/user/:userId', authMiddleware.verifyToken, bookingController.getUserBookings);

// Get a specific booking by ID
router.get('/:id', authMiddleware.verifyToken, bookingController.getBooking);

// Update a booking status
router.put('/:id', authMiddleware.verifyToken, bookingController.updateBookingStatus);

// Cancel a booking
router.post('/:bookingId/cancel', authMiddleware.verifyToken, bookingController.cancelBooking);

// Delete a booking
router.delete('/:id', authMiddleware.verifyToken, bookingController.deleteBooking);

// Admin accept a booking
router.put('/:id/accept', authMiddleware.isAdmin, bookingController.acceptBooking);

// Pay for a booking
router.post('/:id/pay', authMiddleware.verifyToken, bookingController.payForBooking);

module.exports = router;