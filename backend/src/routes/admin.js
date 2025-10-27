const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Request logging middleware
router.use((req, res, next) => {
    console.log('[AdminRoutes] Received request:', {
        method: req.method,
        url: req.url,
        params: req.params,
        path: req.path
    });
    next();
});

// Public test-db route
router.get('/test-db', adminController.testDatabase);

// Middleware to protect admin routes
router.use(authMiddleware.isAdmin);

// User routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.delete('/users/:id', adminController.deleteUser);

// Car metrics and management routes
router.get('/metrics/cars', adminController.getCarMetrics);
router.post('/cars', adminController.addCar);
router.put('/cars/:id/availability', adminController.updateCarAvailability);
router.delete('/cars/:id', adminController.deleteCar);

// Booking routes
router.get('/bookings', adminController.getBookingMetrics);
router.put('/bookings/:id/accept', adminController.acceptBooking);
router.put('/bookings/:id/reject', adminController.rejectBooking);

// Metrics routes
router.get('/metrics/bookings', adminController.getBookingMetrics);
router.get('/metrics/cars', adminController.getCarMetrics);

module.exports = router;