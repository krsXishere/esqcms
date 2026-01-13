const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

/**
 * Middleware to check if inspector owns the DIR
 */
const checkDirOwnership = async (req, res, next) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.id;
        const dirId = req.params.id;

        // Skip ownership check for non-inspectors
        if (userRole !== 'inspector') {
            return next();
        }

        const dir = await prisma.dir.findFirst({
            where: {
                id: dirId,
                deletedAt: null,
            },
            select: {
                operatorId: true,
                status: true,
            },
        });

        if (!dir) {
            return ResponseHelper.notFound(res, 'DIR not found');
        }

        // Inspector can only access their own DIR
        if (dir.operatorId !== userId) {
            return ResponseHelper.error(
                res,
                'Access denied. You can only access your own checksheets.',
                null,
                403
            );
        }

        // Store status in request for further checks
        req.checksheetStatus = dir.status;
        next();
    } catch (error) {
        console.error('Error checking DIR ownership:', error);
        return ResponseHelper.error(res, 'Failed to verify ownership');
    }
};

/**
 * Middleware to check if inspector owns the FI
 */
const checkFiOwnership = async (req, res, next) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.id;
        const fiId = req.params.id;

        // Skip ownership check for non-inspectors
        if (userRole !== 'inspector') {
            return next();
        }

        const fi = await prisma.fi.findFirst({
            where: {
                id: fiId,
                deletedAt: null,
            },
            select: {
                operatorId: true,
                status: true,
            },
        });

        if (!fi) {
            return ResponseHelper.notFound(res, 'FI not found');
        }

        // Inspector can only access their own FI
        if (fi.operatorId !== userId) {
            return ResponseHelper.error(
                res,
                'Access denied. You can only access your own checksheets.',
                null,
                403
            );
        }

        // Store status in request for further checks
        req.checksheetStatus = fi.status;
        next();
    } catch (error) {
        console.error('Error checking FI ownership:', error);
        return ResponseHelper.error(res, 'Failed to verify ownership');
    }
};

/**
 * Middleware to check if measurement belongs to user's DIR
 */
const checkMeasurementOwnership = async (req, res, next) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.id;

        // Skip ownership check for non-inspectors
        if (userRole !== 'inspector') {
            return next();
        }

        let dirId;

        // For create, get dirId from body
        if (req.method === 'POST' && req.body.dirId) {
            dirId = req.body.dirId;
        }
        // For update/delete, get from measurement
        else if (req.params.id) {
            const measurement = await prisma.measurement.findFirst({
                where: { id: req.params.id, deletedAt: null },
                select: { dirId: true },
            });

            if (!measurement) {
                return ResponseHelper.notFound(res, 'Measurement not found');
            }

            dirId = measurement.dirId;
        }

        if (!dirId) {
            return next();
        }

        // Check DIR ownership
        const dir = await prisma.dir.findFirst({
            where: { id: dirId, deletedAt: null },
            select: { operatorId: true, status: true },
        });

        if (!dir) {
            return ResponseHelper.notFound(res, 'DIR not found');
        }

        if (dir.operatorId !== userId) {
            return ResponseHelper.error(
                res,
                'Access denied. You can only modify measurements for your own checksheets.',
                null,
                403
            );
        }

        req.checksheetStatus = dir.status;
        next();
    } catch (error) {
        console.error('Error checking measurement ownership:', error);
        return ResponseHelper.error(res, 'Failed to verify ownership');
    }
};

/**
 * Middleware to check if visual inspection belongs to user's FI
 */
const checkVisualInspectionOwnership = async (req, res, next) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.id;

        // Skip ownership check for non-inspectors
        if (userRole !== 'inspector') {
            return next();
        }

        let fiId;

        // For create, get fiId from body
        if (req.method === 'POST' && req.body.fiId) {
            fiId = req.body.fiId;
        }
        // For update/delete, get from visual inspection
        else if (req.params.id) {
            const vi = await prisma.visualInspection.findFirst({
                where: { id: req.params.id, deletedAt: null },
                select: { fiId: true },
            });

            if (!vi) {
                return ResponseHelper.notFound(res, 'Visual inspection not found');
            }

            fiId = vi.fiId;
        }

        if (!fiId) {
            return next();
        }

        // Check FI ownership
        const fi = await prisma.fi.findFirst({
            where: { id: fiId, deletedAt: null },
            select: { operatorId: true, status: true },
        });

        if (!fi) {
            return ResponseHelper.notFound(res, 'FI not found');
        }

        if (fi.operatorId !== userId) {
            return ResponseHelper.error(
                res,
                'Access denied. You can only modify visual inspections for your own checksheets.',
                null,
                403
            );
        }

        req.checksheetStatus = fi.status;
        next();
    } catch (error) {
        console.error('Error checking visual inspection ownership:', error);
        return ResponseHelper.error(res, 'Failed to verify ownership');
    }
};

module.exports = {
    checkDirOwnership,
    checkFiOwnership,
    checkMeasurementOwnership,
    checkVisualInspectionOwnership,
};
