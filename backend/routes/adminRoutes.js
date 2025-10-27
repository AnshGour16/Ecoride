const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Car management routes
router.get('/cars', auth.requireAdmin, adminController.getAllCars);
router.post('/cars', auth.requireAdmin, adminController.addCar);
router.put('/cars/:id', auth.requireAdmin, adminController.updateCar);
router.delete('/cars/:id', auth.requireAdmin, adminController.deleteCar);
router.put('/cars/:id/availability', auth.requireAdmin, adminController.toggleCarAvailability);

module.exports = router;