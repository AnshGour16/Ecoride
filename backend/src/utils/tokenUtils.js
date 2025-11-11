const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { 
            id: parseInt(user.id),
            role: user.role,
            email: user.email 
        }, 
        process.env.JWT_SECRET || 'your-secret-key-here',
        { expiresIn: '1h' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
        { 
            id: parseInt(user.id),
            tokenVersion: user.tokenVersion || 0
        },
        process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-here',
        { expiresIn: '7d' } // Long-lived refresh token
    );

    return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(
            token, 
            process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-here'
        );
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

module.exports = {
    generateTokens,
    verifyRefreshToken
};