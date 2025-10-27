function validateCarData(data) {
    const errors = [];

    // Required fields
    const requiredFields = ['brand', 'model', 'year', 'price', 'category', 
                         'transmission', 'fuel_type', 'seats'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate numeric fields
    if (data.year) {
        const year = parseInt(data.year);
        if (isNaN(year) || year < 2000 || year > 2025) {
            errors.push('Year must be between 2000 and 2025');
        }
    }

    if (data.price) {
        const price = parseFloat(data.price);
        if (isNaN(price) || price <= 0) {
            errors.push('Price must be a positive number');
        }
    }

    if (data.seats) {
        const seats = parseInt(data.seats);
        if (isNaN(seats) || seats < 2 || seats > 9) {
            errors.push('Number of seats must be between 2 and 9');
        }
    }

    // Validate string fields have content
    if (data.brand && data.brand.trim().length === 0) {
        errors.push('Brand cannot be empty');
    }
    if (data.model && data.model.trim().length === 0) {
        errors.push('Model cannot be empty');
    }

    // Validate category is one of the allowed values
    const validCategories = ['economy', 'luxury', 'suv', 'electric', 'hybrid'];
    if (data.category && !validCategories.includes(data.category.toLowerCase())) {
        errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Import required models
const User = require('../models/user');
const Booking = require('../models/booking');
const Car = require('../models/car');
const { query } = require('../config/db');

// Test endpoint to verify database connectivity
exports.testDatabase = async (req, res) => {
    try {
        console.log('Testing database connection...');
        
        // Test users table
        const users = await query('SELECT COUNT(*) as count FROM users');
        console.log('Users count:', users[0].count);
        
        // Test bookings table
        const bookings = await query('SELECT COUNT(*) as count FROM bookings');
        console.log('Bookings count:', bookings[0].count);
        
        // Test cars table
        const cars = await query('SELECT COUNT(*) as count FROM cars');
        console.log('Cars count:', cars[0].count);
        
        res.status(200).json({
            status: 'success',
            counts: {
                users: users[0].count,
                bookings: bookings[0].count,
                cars: cars[0].count
            }
        });
    } catch (error) {
        console.error('Database test failed:', {
            message: error.message,
            code: error.code,
            sqlState: error.sqlState
        });
        res.status(500).json({
            status: 'error',
            message: 'Database test failed',
            error: error.message
        });
    }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
    console.log('getAllUsers called');
    try {
        console.log('Fetching users from database...');
        const users = await User.findAll();
        console.log('Users fetched:', users);
        
        if (!users) {
            console.log('No users found, returning empty array');
            return res.status(200).json([]);
        }
        
        // Ensure we're sending an array
        const userArray = Array.isArray(users) ? users : [users];
        console.log('Sending response with users:', userArray.length);
        res.status(200).json(userArray);
    } catch (error) {
        console.error('Error in getAllUsers:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            message: 'Error retrieving users', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Delete a user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await User.destroy({ where: { id } });
        if (success) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ 
            message: 'Error deleting user', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: View booking metrics
exports.getBookingMetrics = async (req, res) => {
    console.log('getBookingMetrics called');
    try {
        console.log('Fetching bookings from database...');
        const bookings = await Booking.findAll();
        console.log('Bookings fetched:', bookings);
        
        if (!bookings) {
            console.log('No bookings found, returning zero metrics');
            return res.status(200).json({
                totalBookings: 0,
                completedBookings: 0,
                pendingBookings: 0
            });
        }
        
        // Ensure we're working with an array
        const bookingArray = Array.isArray(bookings) ? bookings : [bookings];
        console.log('Processing bookings array:', bookingArray.length);
        
        const totalBookings = bookingArray.length;
        const completedBookings = bookingArray.filter(b => b.status === 'completed').length;
        const pendingBookings = bookingArray.filter(b => b.status === 'pending').length;

        console.log('Calculated metrics:', {
            totalBookings,
            completedBookings,
            pendingBookings
        });

        res.status(200).json({
            totalBookings,
            completedBookings,
            pendingBookings
        });
    } catch (error) {
        console.error('Error in getBookingMetrics:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            message: 'Error retrieving booking metrics', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Get user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ 
            message: 'Error retrieving user details', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Get car metrics
exports.getCarMetrics = async (req, res) => {
    try {
        const cars = await Car.findAll();
        if (!cars) {
            return res.status(200).json({
                totalCars: 0,
                availableCars: 0,
                unavailableCars: 0,
                byCategory: []
            });
        }
        
        // Ensure we're working with an array
        const carArray = Array.isArray(cars) ? cars : [cars];
        
        const totalCars = carArray.length;
        const availableCars = carArray.filter(c => c.availability).length;
        const unavailableCars = carArray.filter(c => !c.availability).length;

        // Get metrics by category
        const categoryMetrics = carArray.reduce((acc, car) => {
            acc[car.category] = (acc[car.category] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            totalCars,
            availableCars,
            unavailableCars,
            byCategory: Object.entries(categoryMetrics).map(([category, count]) => ({
                category,
                count
            }))
        });
    } catch (error) {
        console.error('Error in getCarMetrics:', error);
        res.status(500).json({ 
            message: 'Error retrieving car metrics', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Add a new car
exports.addCar = async (req, res) => {
    console.log('[AdminController] addCar called with body:', req.body);
    try {
        if (!req.body || typeof req.body !== 'object') {
            console.error('[AdminController] Invalid request body:', req.body);
            return res.status(400).json({
                message: 'Invalid request body',
                error: 'Request body must be a valid JSON object'
            });
        }

        // Validate required fields and data types
        const validation = validateCarData(req.body);
        if (!validation.isValid) {
            console.log('[AdminController] Validation failed:', validation.errors);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        
        // Prepare car data with proper type conversions and data cleaning
        const carData = {
            brand: String(req.body.brand).trim(),
            model: String(req.body.model).trim(),
            year: parseInt(req.body.year),
            price: parseFloat(req.body.price),
            category: String(req.body.category).toLowerCase(),
            transmission: String(req.body.transmission).trim(),
            fuel_type: String(req.body.fuel_type).trim(),
            seats: parseInt(req.body.seats),
            image_url: req.body.image_url || null,
            mileage: req.body.mileage || 0,
            license_plate: req.body.license_plate || null,
            vin: req.body.vin || null,
            features: req.body.features ? JSON.stringify(req.body.features) : '[]',
            location_id: req.body.location_id || 1,
            availability: req.body.availability === 'true' || req.body.availability === true
        };
        
        console.log('[AdminController] Creating car with data:', carData);
        
        // Create car in database
        const carId = await Car.create(carData);
        
        console.log('[AdminController] Car created with ID:', carId);
        
        // Fetch the newly created car
        const newCar = await Car.findById(carId);
        console.log('[AdminController] New car details:', newCar);
        
        res.status(201).json(newCar);
    } catch (error) {
        console.error('[AdminController] Error in addCar:', {
            message: error.message,
            code: error.code,
            sqlState: error.sqlState,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error adding car', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Update a car
exports.updateCar = async (req, res) => {
    const { id } = req.params;
    console.log(`updateCar called for car ID: ${id} with body:`, req.body);
    
    try {
        // Find car by ID
        const car = await Car.findOne({ where: { id } });
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        
        // Update only provided fields
        const updateData = {};
        const allowedFields = ['brand', 'model', 'year', 'price', 'category', 
                              'transmission', 'fuel_type', 'seats', 'image_url', 'availability'];
                              
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // Handle special cases
                if (field === 'year' || field === 'seats') {
                    updateData[field] = parseInt(req.body[field]);
                } else if (field === 'price') {
                    updateData[field] = parseFloat(req.body[field]);
                } else if (field === 'availability') {
                    updateData[field] = req.body[field] === 'true' || req.body[field] === true;
                } else {
                    updateData[field] = req.body[field];
                }
            }
        });
        
        console.log('Updating car with data:', updateData);
        
        // Update car in database
        const [updated] = await Car.update(updateData, { where: { id } });
        
        if (updated) {
            // Fetch the updated car to return
            const updatedCar = await Car.findOne({ where: { id } });
            console.log('Car updated successfully:', updatedCar);
            return res.status(200).json(updatedCar);
        } else {
            return res.status(500).json({ message: 'Failed to update car' });
        }
    } catch (error) {
        console.error('Error in updateCar:', error);
        res.status(500).json({ 
            message: 'Error updating car', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Delete a car
exports.deleteCar = async (req, res) => {
    const { id } = req.params;
    console.log('[AdminController] deleteCar called with:', {
        id,
        params: req.params,
        url: req.url,
        method: req.method
    });
    
    try {
        // Check if car exists
        console.log('[AdminController] Checking if car exists...');
        const car = await Car.findById(id);
        console.log('[AdminController] Car found:', car);
        
        if (!car) {
            console.log('[AdminController] Car not found');
            return res.status(404).json({ message: 'Car not found' });
        }
        
        // Delete car
        console.log('[AdminController] Attempting to delete car...');
        const deleted = await Car.delete(id);
        console.log('[AdminController] Delete result:', deleted);
        
        if (deleted) {
            console.log(`[AdminController] Car ID ${id} deleted successfully`);
            return res.status(200).json({ message: 'Car deleted successfully' });
        } else {
            console.log('[AdminController] Failed to delete car');
            return res.status(500).json({ message: 'Failed to delete car' });
        }
    } catch (error) {
        console.error('[AdminController] Error in deleteCar:', error);
        res.status(500).json({ 
            message: 'Error deleting car', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Update car availability only
exports.updateCarAvailability = async (req, res) => {
    try {
        console.log('Updating car availability:', { id: req.params.id, body: req.body });
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const availability = req.body.availability === true || req.body.availability === 'true';
        const success = await Car.updateAvailability(req.params.id, availability);
        
        if (success) {
            const updatedCar = await Car.findById(req.params.id);
            res.status(200).json({ message: 'Car availability updated', car: updatedCar });
        } else {
            throw new Error('Failed to update car availability');
        }
    } catch (error) {
        console.error('Error in updateCarAvailability:', error);
        res.status(500).json({ message: 'Error updating car availability', error: error.message });
    }
};

// Admin: Get all cars
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.findAll();
        if (!cars) {
            return res.status(200).json([]);
        }
        
        // Ensure we're sending an array
        const carArray = Array.isArray(cars) ? cars : [cars];
        res.status(200).json(carArray);
    } catch (error) {
        console.error('Error in getAllCars:', error);
        res.status(500).json({ 
            message: 'Error retrieving cars', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Get car by ID
exports.getCarById = async (req, res) => {
    const { id } = req.params;
    try {
        const car = await Car.findById(id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json(car);
    } catch (error) {
        console.error('Error in getCarById:', error);
        res.status(500).json({ 
            message: 'Error retrieving car details', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Accept a booking
exports.acceptBooking = async (req, res) => {
    const { id } = req.params;
    console.log(`acceptBooking called for booking ID: ${id}`);
    
    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const updated = await Booking.updateStatus(id, 'accepted');
        if (updated) {
            console.log(`Booking ID ${id} accepted successfully`);
            return res.status(200).json({ message: 'Booking accepted successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to accept booking' });
        }
    } catch (error) {
        console.error('Error in acceptBooking:', error);
        res.status(500).json({ 
            message: 'Error accepting booking', 
            error: error.message || 'Unknown error occurred'
        });
    }
};

// Admin: Reject a booking
exports.rejectBooking = async (req, res) => {
    const { id } = req.params;
    console.log(`rejectBooking called for booking ID: ${id}`);
    
    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const updated = await Booking.updateStatus(id, 'rejected');
        if (updated) {
            console.log(`Booking ID ${id} rejected successfully`);
            return res.status(200).json({ message: 'Booking rejected successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to reject booking' });
        }
    } catch (error) {
        console.error('Error in rejectBooking:', error);
        res.status(500).json({ 
            message: 'Error rejecting booking', 
            error: error.message || 'Unknown error occurred'
        });
    }
};