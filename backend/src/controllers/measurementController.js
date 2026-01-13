const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const measurementService = require('../services/measurementService');

class MeasurementController {
    /**
     * Get all measurements with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, dirId = '', status = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(dirId && { dirId }),
                ...(status && { status }),
            };

            const [measurements, total] = await Promise.all([
                prisma.measurement.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        dir: {
                            select: {
                                id: true,
                                idDir: true,
                                serialNumber: true,
                            },
                        },
                    },
                }),
                prisma.measurement.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, measurements, pagination, 'Measurements retrieved successfully');
        } catch (error) {
            console.error('Error fetching measurements:', error);
            return ResponseHelper.error(res, 'Failed to fetch measurements');
        }
    }

    /**
     * Get measurements by DIR ID
     */
    async getByDirId(req, res) {
        try {
            const { dirId } = req.params;

            const measurements = await prisma.measurement.findMany({
                where: { dirId, deletedAt: null },
                orderBy: { createdAt: 'asc' },
            });

            return ResponseHelper.success(res, measurements, 'Measurements retrieved successfully');
        } catch (error) {
            console.error('Error fetching measurements:', error);
            return ResponseHelper.error(res, 'Failed to fetch measurements');
        }
    }

    /**
     * Get measurement by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const measurement = await prisma.measurement.findFirst({
                where: { id, deletedAt: null },
                include: {
                    dir: {
                        select: {
                            id: true,
                            idDir: true,
                            serialNumber: true,
                        },
                    },
                },
            });

            if (!measurement) {
                return ResponseHelper.notFound(res, 'Measurement not found');
            }

            return ResponseHelper.success(res, measurement, 'Measurement retrieved successfully');
        } catch (error) {
            console.error('Error fetching measurement:', error);
            return ResponseHelper.error(res, 'Failed to fetch measurement');
        }
    }

    /**
     * Create new measurement
     */
    async create(req, res) {
        try {
            const {
                dirId,
                dimensional,
                nominal,
                toleranceMin,
                toleranceMax,
                actual,
            } = req.body;

            // Validate required fields
            if (!dirId || dimensional === undefined || nominal === undefined ||
                toleranceMin === undefined || toleranceMax === undefined || actual === undefined) {
                return ResponseHelper.badRequest(res, 'All required fields must be provided');
            }

            // Check if DIR exists
            const dirExists = await prisma.dir.findFirst({
                where: { id: dirId, deletedAt: null },
            });

            if (!dirExists) {
                return ResponseHelper.badRequest(res, 'DIR not found');
            }

            // Calculate status based on tolerance
            const status = measurementService.calculateStatus(actual, toleranceMin, toleranceMax);

            const measurement = await prisma.measurement.create({
                data: {
                    dirId,
                    dimensional: parseFloat(dimensional),
                    nominal: parseFloat(nominal),
                    toleranceMin: parseFloat(toleranceMin),
                    toleranceMax: parseFloat(toleranceMax),
                    actual: parseFloat(actual),
                    status,
                },
                include: {
                    dir: {
                        select: {
                            id: true,
                            idDir: true,
                            serialNumber: true,
                        },
                    },
                },
            });

            return ResponseHelper.created(res, measurement, 'Measurement created successfully');
        } catch (error) {
            console.error('Error creating measurement:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid DIR reference');
            }
            return ResponseHelper.error(res, 'Failed to create measurement');
        }
    }

    /**
     * Create multiple measurements at once
     */
    async createBulk(req, res) {
        try {
            const { dirId, measurements } = req.body;

            if (!dirId || !measurements || !Array.isArray(measurements) || measurements.length === 0) {
                return ResponseHelper.badRequest(res, 'DIR ID and measurements array are required');
            }

            // Check if DIR exists
            const dirExists = await prisma.dir.findFirst({
                where: { id: dirId, deletedAt: null },
            });

            if (!dirExists) {
                return ResponseHelper.badRequest(res, 'DIR not found');
            }

            // Prepare measurements data with calculated status
            const measurementsData = measurements.map(m => ({
                dirId,
                dimensional: parseFloat(m.dimensional),
                nominal: parseFloat(m.nominal),
                toleranceMin: parseFloat(m.toleranceMin),
                toleranceMax: parseFloat(m.toleranceMax),
                actual: parseFloat(m.actual),
                status: measurementService.calculateStatus(m.actual, m.toleranceMin, m.toleranceMax),
            }));

            const result = await prisma.measurement.createMany({
                data: measurementsData,
            });

            return ResponseHelper.created(res, { count: result.count }, `${result.count} measurements created successfully`);
        } catch (error) {
            console.error('Error creating measurements:', error);
            return ResponseHelper.error(res, 'Failed to create measurements');
        }
    }

    /**
     * Update measurement
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                dimensional,
                nominal,
                toleranceMin,
                toleranceMax,
                actual,
            } = req.body;

            const existingMeasurement = await prisma.measurement.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingMeasurement) {
                return ResponseHelper.notFound(res, 'Measurement not found');
            }

            // Calculate new status if actual or tolerance values are updated
            const newActual = actual !== undefined ? parseFloat(actual) : existingMeasurement.actual;
            const newToleranceMin = toleranceMin !== undefined ? parseFloat(toleranceMin) : existingMeasurement.toleranceMin;
            const newToleranceMax = toleranceMax !== undefined ? parseFloat(toleranceMax) : existingMeasurement.toleranceMax;
            const status = measurementService.calculateStatus(newActual, newToleranceMin, newToleranceMax);

            const measurement = await prisma.measurement.update({
                where: { id },
                data: {
                    ...(dimensional !== undefined && { dimensional: parseFloat(dimensional) }),
                    ...(nominal !== undefined && { nominal: parseFloat(nominal) }),
                    ...(toleranceMin !== undefined && { toleranceMin: parseFloat(toleranceMin) }),
                    ...(toleranceMax !== undefined && { toleranceMax: parseFloat(toleranceMax) }),
                    ...(actual !== undefined && { actual: parseFloat(actual) }),
                    status,
                },
                include: {
                    dir: {
                        select: {
                            id: true,
                            idDir: true,
                            serialNumber: true,
                        },
                    },
                },
            });

            return ResponseHelper.success(res, measurement, 'Measurement updated successfully');
        } catch (error) {
            console.error('Error updating measurement:', error);
            return ResponseHelper.error(res, 'Failed to update measurement');
        }
    }

    /**
     * Soft delete measurement
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingMeasurement = await prisma.measurement.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingMeasurement) {
                return ResponseHelper.notFound(res, 'Measurement not found');
            }

            await prisma.measurement.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Measurement deleted successfully');
        } catch (error) {
            console.error('Error deleting measurement:', error);
            return ResponseHelper.error(res, 'Failed to delete measurement');
        }
    }
}

module.exports = new MeasurementController();
