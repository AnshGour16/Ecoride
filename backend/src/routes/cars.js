const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all cars
router.get('/', carController.getAllCars);

// Get a single car by ID
router.get('/:id', carController.getCarById);

// Create a new car
router.post('/', authMiddleware.isAdmin, carController.createCar);

// Update a car by ID
router.put('/:id', authMiddleware.isAdmin, carController.updateCar);

// Delete a car by ID
router.delete('/:id', authMiddleware.isAdmin, carController.deleteCar);

module.exports = router;