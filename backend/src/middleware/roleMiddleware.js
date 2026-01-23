const ResponseHelper = require('../utils/responseHelper');

/**
 * Middleware to check if user has required role(s)
 * @param {Array} allowedRoles - Array of allowed roles
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return ResponseHelper.badRequest(res, 'User role not found');
        }

        if (!allowedRoles.includes(userRole)) {
            return ResponseHelper.error(
                res,
                'Access denied. Insufficient permissions.',
                403
            );
        }

        next();
    };
};

/**
 * Middleware to check if user can create checksheet (DIR/FI)
 * Only Inspector can create checksheet
 */
const canCreateChecksheet = (req, res, next) => {
    const userRole = req.user?.role;

    if (userRole !== 'inspector') {
        return ResponseHelper.error(
            res,
            'Only inspectors can create checksheets',
            403
        );
    }

    next();
};

/**
 * Middleware to check if user can approve checksheet
 * Only Supervisor can approve
 */
const canApproveChecksheet = (req, res, next) => {
    const userRole = req.user?.role;

    if (userRole !== 'supervisor') {
        return ResponseHelper.error(
            res,
            'Only supervisors can approve checksheets',
            403
        );
    }

    next();
};

/**
 * Middleware to check if user can manage master data
 * Only Super Admin (operator role used for admin) can manage master data
 */
const canManageMasterData = (req, res, next) => {
    const userRole = req.user?.role;

    if (userRole !== 'operator') {
        return ResponseHelper.error(
            res,
            'Only administrators can manage master data',
            403
        );
    }

    next();
};

/**
 * Middleware to check if user can view analytics
 * Only Supervisor and Operator (admin)
 */
const canViewAnalytics = (req, res, next) => {
    const userRole = req.user?.role;

    if (!['supervisor', 'operator'].includes(userRole)) {
        return ResponseHelper.error(
            res,
            'Access denied to analytics',
            403
        );
    }

    next();
};

module.exports = {
    checkRole,
    canCreateChecksheet,
    canApproveChecksheet,
    canManageMasterData,
    canViewAnalytics,
};
