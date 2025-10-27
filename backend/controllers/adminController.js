const { Car } = require('../models');

// ...existing code...

const getAllCars = async (req, res) => {
    try {
        const cars = await Car.findAll();
        res.json(cars);
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ message: 'Error fetching cars' });
    }
};

const addCar = async (req, res) => {
    try {
        console.log('Received car data:', req.body);
        
        // Validate required fields
        const requiredFields = ['brand', 'model', 'year', 'price', 'category'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Generate unique identifiers
        const licensePlate = `ECO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const vin = `VIN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        const carData = {
            ...req.body,
            license_plate: licensePlate,
            vin: vin,
            availability: req.body.availability ?? true
        };

        const car = await Car.create(carData);
        res.status(201).json({ message: 'Car added successfully', car });
    } catch (error) {
        console.error('Error adding car:', error);
        res.status(500).json({ 
            message: 'Error adding car',
            error: error.message 
        });
    }
};

const updateCar = async (req, res) => {
    try {
        const carId = req.params.id;
        const carData = req.body;

        const car = await Car.findByPk(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        await car.update(carData);
        res.json({ message: 'Car updated successfully', car });
    } catch (error) {
        console.error('Error updating car:', error);
        res.status(500).json({ message: 'Error updating car' });
    }
};

const deleteCar = async (req, res) => {
    try {
        const carId = req.params.id;

        const car = await Car.findByPk(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        await car.destroy();
        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ message: 'Error deleting car' });
    }
};

const toggleCarAvailability = async (req, res) => {
    try {
        const carId = req.params.id;
        const { availability } = req.body;

        const car = await Car.findByPk(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        car.availability = availability;
        await car.save();

        res.json({ message: 'Car availability updated successfully', car });
    } catch (error) {
        console.error('Error updating car availability:', error);
        res.status(500).json({ message: 'Error updating car availability' });
    }
};

// ...existing code...

module.exports = {
    // ...existing exports...
    getAllCars,
    addCar,
    updateCar,
    deleteCar,
    toggleCarAvailability
};