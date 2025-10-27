const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
    console.log('=== VERIFY TOKEN MIDDLEWARE ===');
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            console.error('No authorization header found');
            return res.status(401).json({ 
                message: 'Access denied. No token provided.',
                code: 'AUTH_NO_TOKEN' 
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.error('Invalid authorization header format');
            return res.status(401).json({ 
                message: 'Access denied. Invalid token format.',
                code: 'AUTH_INVALID_FORMAT' 
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-here');
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError.message);
            return res.status(401).json({ 
                message: jwtError.name === 'TokenExpiredError' ? 
                    'Access denied. Token has expired.' : 
                    'Access denied. Invalid token.',
                code: jwtError.name === 'TokenExpiredError' ? 
                    'AUTH_TOKEN_EXPIRED' : 
                    'AUTH_INVALID_TOKEN'
            });
        }

        console.log('Decoded token:', {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        });
        
        // Ensure user ID is a number
        if (!decoded.id || isNaN(parseInt(decoded.id))) {
            console.error('Invalid user ID in token:', decoded.id);
            return res.status(401).json({ 
                message: 'Invalid token',
                error: 'Token contains invalid user ID'
            });
        }
        
        // Set user data in request
        req.user = {
            id: parseInt(decoded.id),
            role: decoded.role,
            email: decoded.email
        };
        
        next();
    } catch (error) {
        console.error('JWT verification error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(403).json({ message: 'Invalid token.' });
    }
};

// Admin role check middleware
const isAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        console.log('Checking admin privileges for user:', req.user);
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        if (req.user.role !== 'admin') {
            console.warn('Non-admin access attempt by user:', req.user);
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        console.log('Admin access granted for user:', req.user);
        next();
    });
};

module.exports = {
    verifyToken,
    isAdmin
};