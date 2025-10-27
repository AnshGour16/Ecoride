const Car = require('../models/car');
const { testConnection } = require('../config/db');

// Create a new car
exports.createCar = async (req, res) => {
    try {
        const { model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability } = req.body;
        const carId = await Car.create({
            model, brand, year, price, category, transmission, fuel_type,
            seats, mileage, license_plate, vin, image_url, features,
            location_id, availability
        });
        const newCar = await Car.findById(carId);
        res.status(201).json({ message: 'Car created successfully', car: newCar });
    } catch (error) {
        res.status(500).json({ message: 'Error creating car', error: error.message });
    }
};

// Get all cars
exports.getAllCars = async (req, res) => {
    try {
        console.log('[CarController] Request received for all cars');
        
        // Test database connection first
        console.log('[CarController] Testing database connection...');
        const isConnected = await testConnection();
        if (!isConnected) {
            console.error('[CarController] Database connection failed');
            throw new Error('Database connection failed');
        }
        console.log('[CarController] Database connection successful');
        
        console.log('[CarController] Fetching all cars...');
        const cars = await Car.findAll();
        console.log(`[CarController] Found ${cars.length} cars`);
        
        if (!Array.isArray(cars)) {
            console.error('[CarController] Expected array but got:', typeof cars);
            throw new Error('Invalid response format from database');
        }
        
        // Add CORS headers explicitly
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        console.log('[CarController] Sending response with cars:', cars);
        res.status(200).json(cars);
        console.log('[CarController] Response sent successfully');
    } catch (error) {
        console.error('[CarController] Error fetching cars:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState
        });
        
        res.status(500).json({ 
            message: 'Error fetching cars', 
            error: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get a car by ID
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json(car);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching car', error: error.message });
    }
};

// Update a car
exports.updateCar = async (req, res) => {
    try {
        const { model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability } = req.body;
        const updated = await Car.update(req.params.id, {
            model, brand, year, price, category, transmission, fuel_type, 
            seats, mileage, license_plate, vin, image_url, features, 
            location_id, availability
        });
        if (!updated) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json({ message: 'Car updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating car', error: error.message });
    }
};

// Delete a car
exports.deleteCar = async (req, res) => {
    try {
        const deleted = await Car.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting car', error: error.message });
    }
};