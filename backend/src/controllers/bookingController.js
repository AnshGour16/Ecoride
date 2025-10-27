// Fixed bookingController.js
const Booking = require('../models/booking');
const User = require('../models/user');
const Car = require('../models/car');
const { query } = require('../config/db');

// Create a new booking with detailed logging
exports.createBooking = async (req, res) => {
    console.log('=== CREATE BOOKING REQUEST ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    
    // Extract data from request body
    const { user_id, car_id, start_date, end_date, pickup_location_id, dropoff_location_id, driver_license_number } = req.body;
    
    console.log('Extracted values:');
    console.log('- user_id:', user_id, typeof user_id);
    console.log('- car_id:', car_id, typeof car_id);
    console.log('- start_date:', start_date, typeof start_date);
    console.log('- end_date:', end_date, typeof end_date);
    console.log('- pickup_location_id:', pickup_location_id, typeof pickup_location_id);
    console.log('- dropoff_location_id:', dropoff_location_id, typeof dropoff_location_id);
    console.log('- driver_license_number:', driver_license_number, typeof driver_license_number);

    try {
        // Validate required fields with detailed logging
        console.log('Validating required fields...');
        
        const missingFields = [];
        if (!user_id) missingFields.push('user_id');
        if (!car_id) missingFields.push('car_id');
        if (!start_date) missingFields.push('start_date');
        if (!end_date) missingFields.push('end_date');
        
        if (missingFields.length > 0) {
            console.error('Missing fields:', missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`,
                received: { user_id, car_id, start_date, end_date },
                missingFields
            });
        }

        console.log('All required fields present');

        // Convert and validate data types
        let userIdNum, carIdNum, pickupLocationIdNum, dropoffLocationIdNum;
        
        try {
            userIdNum = parseInt(user_id);
            carIdNum = parseInt(car_id);
            // Convert optional fields if they exist
            if (pickup_location_id) pickupLocationIdNum = parseInt(pickup_location_id);
            if (dropoff_location_id) dropoffLocationIdNum = parseInt(dropoff_location_id);
            
            console.log('Converted IDs:', { userIdNum, carIdNum, pickupLocationIdNum, dropoffLocationIdNum });
        } catch (conversionError) {
            console.error('Error converting IDs:', conversionError);
            return res.status(400).json({
                message: 'Invalid ID format',
                error: conversionError.message
            });
        }

        if (isNaN(userIdNum) || isNaN(carIdNum)) {
            console.error('Invalid numeric IDs:', { userIdNum, carIdNum });
            return res.status(400).json({
                message: 'User ID and Car ID must be valid numbers',
                received: { user_id, car_id }
            });
        }

        // Validate dates
        console.log('Validating dates...');
        const start = new Date(start_date);
        const end = new Date(end_date);
        const now = new Date();

        console.log('Parsed dates:', { start, end, now });

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error('Invalid date format');
            return res.status(400).json({
                message: 'Invalid date format. Please use YYYY-MM-DD format',
                received: { start_date, end_date }
            });
        }

        if (start < now) {
            console.error('Start date is in the past');
            return res.status(400).json({ 
                message: 'Start date cannot be in the past',
                start_date: start,
                currentDate: now
            });
        }

        if (end <= start) {
            console.error('End date is not after start date');
            return res.status(400).json({ 
                message: 'End date must be after start date',
                start_date: start,
                end_date: end
            });
        }

        console.log('Date validation passed');

        // Check if user exists
        console.log('Checking if user exists...');
        const userExists = await User.findById(userIdNum);
        if (!userExists) {
            console.error('User not found:', userIdNum);
            return res.status(404).json({ message: 'User not found', user_id: userIdNum });
        }
        console.log('User found:', userExists);

        // Check if car exists
        console.log('Checking if car exists...');
        const carExists = await Car.findById(carIdNum);
        if (!carExists) {
            console.error('Car not found:', carIdNum);
            return res.status(404).json({ message: 'Car not found', car_id: carIdNum });
        }
        console.log('Car found:', carExists);

        // Check for conflicting bookings
        console.log('Checking for conflicting bookings...');
        const conflictingBookings = await Booking.findConflictingBookings(carIdNum, start_date, end_date);
        if (conflictingBookings && conflictingBookings.length > 0) {
            console.error('Conflicting bookings found:', conflictingBookings);
            return res.status(400).json({ 
                message: 'Car is not available for the selected dates',
                conflictingBookings
            });
        }
        console.log('No conflicts found');

        // Calculate total amount based on car price and booking duration
        let totalAmount = 0;
        if (carExists.price) {
            // Calculate days difference between start and end dates
            const durationMs = end.getTime() - start.getTime();
            const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
            totalAmount = carExists.price * durationDays;
        }
        console.log('Calculated total amount:', totalAmount);

        // Create the booking
        console.log('Creating booking...');
        const bookingData = {
            user_id: userIdNum,
            car_id: carIdNum,
            start_date,
            end_date,
            status: 'pending',
            total_amount: totalAmount,
            driver_license_number
        };
        
        // Add optional fields if they exist
        if (pickupLocationIdNum) bookingData.pickup_location_id = pickupLocationIdNum;
        if (dropoffLocationIdNum) bookingData.dropoff_location_id = dropoffLocationIdNum;
        
        console.log('Booking data to insert:', bookingData);
        
        const bookingId = await Booking.create(bookingData);
        console.log('Booking created with ID:', bookingId);

        // Fetch the created booking with all details
        console.log('Fetching created booking...');
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            console.error('Could not retrieve created booking');
            return res.status(500).json({ message: 'Booking created but could not be retrieved' });
        }
        
        console.log('Successfully created and retrieved booking:', booking);
        console.log('=== CREATE BOOKING SUCCESS ===');
        
        res.status(201).json({ 
            message: 'Booking created successfully', 
            booking,
            success: true 
        });
    } catch (error) {
        console.error('=== CREATE BOOKING ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle specific database errors
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            console.error('Foreign key constraint error');
            return res.status(400).json({ 
                message: 'Invalid user ID or car ID provided',
                error: 'Foreign key constraint failed',
                details: error.message
            });
        }
        
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Duplicate entry error');
            return res.status(400).json({
                message: 'Duplicate booking entry',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Error creating booking', 
            error: error.message,
            errorCode: error.code,
            errorType: error.constructor.name
        });
    }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
    try {
        // Fetch all bookings
        const bookings = await Booking.findAll();
        // For each booking, fetch user and car details
        const bookingsWithDetails = await Promise.all(bookings.map(async (b) => {
            let user = null;
            let car = null;
            try {
                user = await User.findById(b.user_id);
            } catch (e) {}
            try {
                car = await Car.findById(b.car_id);
            } catch (e) {}
            return { ...b, user, car };
        }));
        res.json(bookingsWithDetails);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            message: 'Error fetching bookings',
            error: error.message 
        });
    }
};

// Get bookings for a specific user
exports.getUserBookings = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const bookings = await Booking.findByUserId(userId);
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ 
            message: 'Error fetching user bookings',
            error: error.message 
        });
    }
};

// Get a specific booking by ID
exports.getBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ 
            message: 'Error fetching booking',
            error: error.message 
        });
    }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { status } = req.body;
        
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const updatedBooking = await Booking.updateStatus(bookingId, status);
        res.json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ 
            message: 'Error updating booking status',
            error: error.message 
        });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        const updatedBooking = await Booking.updateStatus(bookingId, 'cancelled');
        res.json(updatedBooking);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ 
            message: 'Error cancelling booking',
            error: error.message 
        });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        await Booking.delete(bookingId);
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ 
            message: 'Error deleting booking',
            error: error.message 
        });
    }
};

// Accept a booking
exports.acceptBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    // Update booking status to 'active' when admin accepts
    await Booking.updateStatus(bookingId, 'active');
    // Get the booking to find the car_id
    const booking = await Booking.findById(bookingId);
    if (booking && booking.car_id) {
      // Set the car as unavailable using Car model
      const Car = require('../models/car');
      await Car.update(booking.car_id, { ...await Car.findById(booking.car_id), availability: false });
    }
    res.json({ message: 'Booking accepted and car marked as unavailable' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting booking', error });
  }
};

exports.getDashboardData = async (req, res) => {
    try {
        console.log('=== GET DASHBOARD DATA ===');
        console.log('Request user:', req.user);
        
        // Validate user from token
        if (!req.user || !req.user.id) {
            console.error('Invalid user data in token:', req.user);
            return res.status(400).json({ 
                message: 'Invalid user authentication',
                error: 'Missing or invalid user ID in token'
            });
        }

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            console.error('Invalid user ID format:', req.user.id);
            return res.status(400).json({ 
                message: 'Invalid user ID format',
                error: 'User ID must be a number'
            });
        }

        console.log('Fetching bookings for user ID:', userId);
        
        // Get all bookings for the user with car details
        const bookings = await Booking.findByUserId(userId);
        console.log('Bookings found:', bookings?.length || 0);
        
        if (!bookings) {
            console.log('No bookings found for user');
            return res.json({
                totalBookings: 0,
                activeBookings: 0,
                currentBooking: null,
                recentActivity: []
            });
        }

        // Get current date for comparison
        const now = new Date();
        
        // Find current active booking (most recent active/confirmed booking)
        const currentBooking = bookings
            .filter(b => ['active', 'confirmed'].includes(b.status.toLowerCase()) && new Date(b.end_date) >= now)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
        
        // Count active bookings
        const activeBookings = bookings.filter(b => 
            ['active', 'confirmed'].includes(b.status.toLowerCase()) && 
            new Date(b.end_date) >= now
        ).length;
        
        // Get recent activity (last 5 bookings)
        const recentActivity = bookings
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(b => ({
                type: 'booking',
                description: `${b.status.charAt(0).toUpperCase() + b.status.slice(1)} booking for ${b.car?.brand || ''} ${b.car?.model || 'a car'}`,
                timestamp: b.created_at
            }));

        console.log('Dashboard data prepared:', {
            totalBookings: bookings.length,
            activeBookings,
            hasCurrentBooking: !!currentBooking,
            recentActivityCount: recentActivity.length
        });

        res.json({
            totalBookings: bookings.length,
            activeBookings,
            currentBooking,
            recentActivity
        });
    } catch (error) {
        console.error('Error getting dashboard data:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ 
            message: 'Error getting dashboard data',
            error: error.message,
            code: error.code
        });
    }
};

// Pay for a booking
exports.payForBooking = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status === 'paid') {
            return res.status(400).json({ message: 'Booking already paid' });
        }
        const { method, amount, cardNumber, expiry, cvc, upiId } = req.body;
        if (!method || !amount) {
            return res.status(400).json({ message: 'Missing payment method or amount' });
        }
        // Validate details based on method
        if (method === 'card') {
            if (!cardNumber || !expiry || !cvc) {
                return res.status(400).json({ message: 'Missing card details' });
            }
        } else if (method === 'upi') {
            if (!upiId) {
                return res.status(400).json({ message: 'Missing UPI ID' });
            }
        }
        // Save e-bill details in booking (as JSON field if available)
        const eBillDetails = {
            method,
            amount,
            cardNumber: cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : undefined,
            expiry,
            upiId,
            paidAt: new Date().toISOString()
        };
        // If your Booking model supports a JSON/details field, update it. Otherwise, just update status and log e-bill.
        await Booking.updateStatus(bookingId, 'paid');
        // Optionally, save e-bill details (pseudo code, adapt to your DB):
        if (typeof Booking.updateEBillDetails === 'function') {
            await Booking.updateEBillDetails(bookingId, eBillDetails);
        } else {
            // Fallback: log to console
            console.log('E-Bill details for booking', bookingId, eBillDetails);
        }
        res.json({ message: 'Payment successful', bookingId, eBillDetails });
    } catch (error) {
        console.error('PAYMENT ERROR:', error);
        res.status(500).json({ message: 'Payment failed', error: error.message });
    }
};