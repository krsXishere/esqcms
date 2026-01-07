const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class PartController {
    /**
     * Get all parts with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { partNumber: { contains: search, mode: 'insensitive' } },
                        { partName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };

            const [parts, total] = await Promise.all([
                prisma.part.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.part.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, parts, pagination, 'Parts retrieved successfully');
        } catch (error) {
            console.error('Error fetching parts:', error);
            return ResponseHelper.error(res, 'Failed to fetch parts');
        }
    }

    /**
     * Get part by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const part = await prisma.part.findFirst({
                where: { id, deletedAt: null },
            });

            if (!part) {
                return ResponseHelper.notFound(res, 'Part not found');
            }

            return ResponseHelper.success(res, part, 'Part retrieved successfully');
        } catch (error) {
            console.error('Error fetching part:', error);
            return ResponseHelper.error(res, 'Failed to fetch part');
        }
    }

    /**
     * Create new part
     */
    async create(req, res) {
        try {
            const { partNumber, partName } = req.body;

            if (!partNumber || !partName) {
                return ResponseHelper.badRequest(res, 'Part number and part name are required');
            }

            // Check if part number already exists
            const existingPart = await prisma.part.findUnique({
                where: { partNumber },
            });

            if (existingPart) {
                return ResponseHelper.badRequest(res, 'Part number already exists');
            }

            const part = await prisma.part.create({
                data: { partNumber, partName },
            });

            return ResponseHelper.created(res, part, 'Part created successfully');
        } catch (error) {
            console.error('Error creating part:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Part number already exists');
            }
            return ResponseHelper.error(res, 'Failed to create part');
        }
    }

    /**
     * Update part
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { partNumber, partName } = req.body;

            const existingPart = await prisma.part.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingPart) {
                return ResponseHelper.notFound(res, 'Part not found');
            }

            // Check if new part number conflicts with another part
            if (partNumber && partNumber !== existingPart.partNumber) {
                const conflictPart = await prisma.part.findUnique({
                    where: { partNumber },
                });
                if (conflictPart && conflictPart.id !== id) {
                    return ResponseHelper.badRequest(res, 'Part number already exists');
                }
            }

            const part = await prisma.part.update({
                where: { id },
                data: { partNumber, partName },
            });

            return ResponseHelper.success(res, part, 'Part updated successfully');
        } catch (error) {
            console.error('Error updating part:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Part number already exists');
            }
            return ResponseHelper.error(res, 'Failed to update part');
        }
    }

    /**
     * Soft delete part
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingPart = await prisma.part.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingPart) {
                return ResponseHelper.notFound(res, 'Part not found');
            }

            await prisma.part.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Part deleted successfully');
        } catch (error) {
            console.error('Error deleting part:', error);
            return ResponseHelper.error(res, 'Failed to delete part');
        }
    }
}

module.exports = new PartController();
