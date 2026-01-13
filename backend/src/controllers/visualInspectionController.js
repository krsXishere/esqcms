const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class VisualInspectionController {
    /**
     * Get all visual inspections with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, fiId = '', status = '', search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(fiId && { fiId }),
                ...(status && { status }),
                ...(search && {
                    itemName: { contains: search, mode: 'insensitive' },
                }),
            };

            const [visualInspections, total] = await Promise.all([
                prisma.visualInspection.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        fi: {
                            select: {
                                id: true,
                                idFi: true,
                                fiNumber: true,
                            },
                        },
                    },
                }),
                prisma.visualInspection.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, visualInspections, pagination, 'Visual inspections retrieved successfully');
        } catch (error) {
            console.error('Error fetching visual inspections:', error);
            return ResponseHelper.error(res, 'Failed to fetch visual inspections');
        }
    }

    /**
     * Get visual inspections by FI ID
     */
    async getByFiId(req, res) {
        try {
            const { fiId } = req.params;

            const visualInspections = await prisma.visualInspection.findMany({
                where: { fiId, deletedAt: null },
                orderBy: { createdAt: 'asc' },
            });

            return ResponseHelper.success(res, visualInspections, 'Visual inspections retrieved successfully');
        } catch (error) {
            console.error('Error fetching visual inspections:', error);
            return ResponseHelper.error(res, 'Failed to fetch visual inspections');
        }
    }

    /**
     * Get visual inspection by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const visualInspection = await prisma.visualInspection.findFirst({
                where: { id, deletedAt: null },
                include: {
                    fi: {
                        select: {
                            id: true,
                            idFi: true,
                            fiNumber: true,
                        },
                    },
                },
            });

            if (!visualInspection) {
                return ResponseHelper.notFound(res, 'Visual inspection not found');
            }

            return ResponseHelper.success(res, visualInspection, 'Visual inspection retrieved successfully');
        } catch (error) {
            console.error('Error fetching visual inspection:', error);
            return ResponseHelper.error(res, 'Failed to fetch visual inspection');
        }
    }

    /**
     * Create new visual inspection
     */
    async create(req, res) {
        try {
            const {
                fiId,
                itemName,
                status = 'good',
                remark,
            } = req.body;

            // Validate required fields
            if (!fiId || !itemName) {
                return ResponseHelper.badRequest(res, 'FI ID and item name are required');
            }

            // Validate status
            const validStatuses = ['good', 'after_repair', 'na'];
            if (!validStatuses.includes(status)) {
                return ResponseHelper.badRequest(res, 'Invalid status. Must be good, after_repair, or na');
            }

            // Check if FI exists
            const fiExists = await prisma.fi.findFirst({
                where: { id: fiId, deletedAt: null },
            });

            if (!fiExists) {
                return ResponseHelper.badRequest(res, 'FI not found');
            }

            const visualInspection = await prisma.visualInspection.create({
                data: {
                    fiId,
                    itemName,
                    status,
                    remark,
                },
                include: {
                    fi: {
                        select: {
                            id: true,
                            idFi: true,
                            fiNumber: true,
                        },
                    },
                },
            });

            return ResponseHelper.created(res, visualInspection, 'Visual inspection created successfully');
        } catch (error) {
            console.error('Error creating visual inspection:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid FI reference');
            }
            return ResponseHelper.error(res, 'Failed to create visual inspection');
        }
    }

    /**
     * Create multiple visual inspections at once
     */
    async createBulk(req, res) {
        try {
            const { fiId, inspections } = req.body;

            if (!fiId || !inspections || !Array.isArray(inspections) || inspections.length === 0) {
                return ResponseHelper.badRequest(res, 'FI ID and inspections array are required');
            }

            // Check if FI exists
            const fiExists = await prisma.fi.findFirst({
                where: { id: fiId, deletedAt: null },
            });

            if (!fiExists) {
                return ResponseHelper.badRequest(res, 'FI not found');
            }

            // Validate all statuses
            const validStatuses = ['good', 'after_repair', 'na'];
            for (const inspection of inspections) {
                if (inspection.status && !validStatuses.includes(inspection.status)) {
                    return ResponseHelper.badRequest(res, 'Invalid status in inspections. Must be good, after_repair, or na');
                }
            }

            // Prepare inspections data
            const inspectionsData = inspections.map(i => ({
                fiId,
                itemName: i.itemName,
                status: i.status || 'good',
                remark: i.remark || null,
            }));

            const result = await prisma.visualInspection.createMany({
                data: inspectionsData,
            });

            return ResponseHelper.created(res, { count: result.count }, `${result.count} visual inspections created successfully`);
        } catch (error) {
            console.error('Error creating visual inspections:', error);
            return ResponseHelper.error(res, 'Failed to create visual inspections');
        }
    }

    /**
     * Update visual inspection
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                itemName,
                status,
                remark,
            } = req.body;

            const existingInspection = await prisma.visualInspection.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingInspection) {
                return ResponseHelper.notFound(res, 'Visual inspection not found');
            }

            // Validate status if provided
            if (status) {
                const validStatuses = ['good', 'after_repair', 'na'];
                if (!validStatuses.includes(status)) {
                    return ResponseHelper.badRequest(res, 'Invalid status. Must be good, after_repair, or na');
                }
            }

            const visualInspection = await prisma.visualInspection.update({
                where: { id },
                data: {
                    ...(itemName && { itemName }),
                    ...(status && { status }),
                    ...(remark !== undefined && { remark }),
                },
                include: {
                    fi: {
                        select: {
                            id: true,
                            idFi: true,
                            fiNumber: true,
                        },
                    },
                },
            });

            return ResponseHelper.success(res, visualInspection, 'Visual inspection updated successfully');
        } catch (error) {
            console.error('Error updating visual inspection:', error);
            return ResponseHelper.error(res, 'Failed to update visual inspection');
        }
    }

    /**
     * Soft delete visual inspection
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingInspection = await prisma.visualInspection.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingInspection) {
                return ResponseHelper.notFound(res, 'Visual inspection not found');
            }

            await prisma.visualInspection.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Visual inspection deleted successfully');
        } catch (error) {
            console.error('Error deleting visual inspection:', error);
            return ResponseHelper.error(res, 'Failed to delete visual inspection');
        }
    }
}

module.exports = new VisualInspectionController();
