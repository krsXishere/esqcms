const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class TypeController {
    /**
     * Get all types with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    typeName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                }),
            };

            const [types, total] = await Promise.all([
                prisma.type.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.type.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, types, pagination, 'Types retrieved successfully');
        } catch (error) {
            console.error('Error fetching types:', error);
            return ResponseHelper.error(res, 'Failed to fetch types');
        }
    }

    /**
     * Get type by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const type = await prisma.type.findFirst({
                where: { id, deletedAt: null },
            });

            if (!type) {
                return ResponseHelper.notFound(res, 'Type not found');
            }

            return ResponseHelper.success(res, type, 'Type retrieved successfully');
        } catch (error) {
            console.error('Error fetching type:', error);
            return ResponseHelper.error(res, 'Failed to fetch type');
        }
    }

    /**
     * Create new type
     */
    async create(req, res) {
        try {
            const { typeName } = req.body;

            if (!typeName) {
                return ResponseHelper.badRequest(res, 'Type name is required');
            }

            const type = await prisma.type.create({
                data: { typeName },
            });

            return ResponseHelper.created(res, type, 'Type created successfully');
        } catch (error) {
            console.error('Error creating type:', error);
            return ResponseHelper.error(res, 'Failed to create type');
        }
    }

    /**
     * Update type
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { typeName } = req.body;

            const existingType = await prisma.type.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingType) {
                return ResponseHelper.notFound(res, 'Type not found');
            }

            const type = await prisma.type.update({
                where: { id },
                data: { typeName },
            });

            return ResponseHelper.success(res, type, 'Type updated successfully');
        } catch (error) {
            console.error('Error updating type:', error);
            return ResponseHelper.error(res, 'Failed to update type');
        }
    }

    /**
     * Soft delete type
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingType = await prisma.type.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingType) {
                return ResponseHelper.notFound(res, 'Type not found');
            }

            await prisma.type.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Type deleted successfully');
        } catch (error) {
            console.error('Error deleting type:', error);
            return ResponseHelper.error(res, 'Failed to delete type');
        }
    }
}

module.exports = new TypeController();
