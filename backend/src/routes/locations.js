const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Adjust if you use a different DB import

// GET /api/locations - return all locations
router.get('/', async (req, res) => {
    try {
        const [locations] = await db.pool.query('SELECT * FROM locations');
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: 'Error fetching locations' });
    }
});

module.exports = router; 