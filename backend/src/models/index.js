const pool = require('../config/db');
const User = require('./user');
const Car = require('./car');
const Booking = require('./booking');

// Initialize database function
const initializeDatabase = async () => {
    try {
        // Test the connection
        await pool.getConnection();
        console.log('Database connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

module.exports = {
    User,
    Car,
    Booking,
    initializeDatabase
};