const ResponseHelper = require('../utils/responseHelper');

/**
 * Middleware to prevent editing approved checksheets
 * Must be used after ownership middleware that sets req.checksheetStatus
 */
const cannotEditApproved = (req, res, next) => {
    const userRole = req.user?.role;
    const status = req.checksheetStatus;

    // Only inspectors are restricted by approved status
    if (userRole === 'inspector' && status === 'approved') {
        return ResponseHelper.error(
            res,
            'Cannot modify approved checksheet. Request revision from supervisor if needed.',
            null,
            403
        );
    }

    next();
};

/**
 * Middleware to check if checksheet can be approved
 * Only pending or revision status can be approved
 */
const canApprove = async (req, res, next) => {
    const status = req.body.status;

    // If not trying to approve, skip this check
    if (status !== 'approved') {
        return next();
    }

    // This will be checked against current status in controller
    next();
};

/**
 * Middleware to prevent status downgrade
 * approved -> revision/pending not allowed by inspector
 */
const cannotDowngradeStatus = (req, res, next) => {
    const userRole = req.user?.role;
    const currentStatus = req.checksheetStatus;
    const newStatus = req.body.status;

    // Only supervisors can change status from approved
    if (currentStatus === 'approved' && newStatus !== 'approved' && userRole !== 'supervisor') {
        return ResponseHelper.error(
            res,
            'Only supervisors can request revision on approved checksheets',
            null,
            403
        );
    }

    next();
};

module.exports = {
    cannotEditApproved,
    canApprove,
    cannotDowngradeStatus,
};
