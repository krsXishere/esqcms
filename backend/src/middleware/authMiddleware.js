const jwt = require('jsonwebtoken');
const ResponseHelper = require('../utils/responseHelper');

const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return ResponseHelper.badRequest(res, 'No token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return ResponseHelper.badRequest(res, 'Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            return ResponseHelper.badRequest(res, 'Invalid token');
        }
        return ResponseHelper.error(res, 'Authentication failed');
    }
};

module.exports = authMiddleware;
