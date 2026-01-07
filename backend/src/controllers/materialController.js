const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class MaterialController {
    /**
     * Get all materials with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    materialName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                }),
            };

            const [materials, total] = await Promise.all([
                prisma.material.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.material.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, materials, pagination, 'Materials retrieved successfully');
        } catch (error) {
            console.error('Error fetching materials:', error);
            return ResponseHelper.error(res, 'Failed to fetch materials');
        }
    }

    /**
     * Get material by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const material = await prisma.material.findFirst({
                where: { id, deletedAt: null },
            });

            if (!material) {
                return ResponseHelper.notFound(res, 'Material not found');
            }

            return ResponseHelper.success(res, material, 'Material retrieved successfully');
        } catch (error) {
            console.error('Error fetching material:', error);
            return ResponseHelper.error(res, 'Failed to fetch material');
        }
    }

    /**
     * Create new material
     */
    async create(req, res) {
        try {
            const { materialName } = req.body;

            if (!materialName) {
                return ResponseHelper.badRequest(res, 'Material name is required');
            }

            const material = await prisma.material.create({
                data: { materialName },
            });

            return ResponseHelper.created(res, material, 'Material created successfully');
        } catch (error) {
            console.error('Error creating material:', error);
            return ResponseHelper.error(res, 'Failed to create material');
        }
    }

    /**
     * Update material
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { materialName } = req.body;

            const existingMaterial = await prisma.material.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingMaterial) {
                return ResponseHelper.notFound(res, 'Material not found');
            }

            const material = await prisma.material.update({
                where: { id },
                data: { materialName },
            });

            return ResponseHelper.success(res, material, 'Material updated successfully');
        } catch (error) {
            console.error('Error updating material:', error);
            return ResponseHelper.error(res, 'Failed to update material');
        }
    }

    /**
     * Soft delete material
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingMaterial = await prisma.material.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingMaterial) {
                return ResponseHelper.notFound(res, 'Material not found');
            }

            await prisma.material.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Material deleted successfully');
        } catch (error) {
            console.error('Error deleting material:', error);
            return ResponseHelper.error(res, 'Failed to delete material');
        }
    }
}

module.exports = new MaterialController();
