const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class ModelController {
    /**
     * Get all models with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    modelName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                }),
            };

            const [models, total] = await Promise.all([
                prisma.model.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.model.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, models, pagination, 'Models retrieved successfully');
        } catch (error) {
            console.error('Error fetching models:', error);
            return ResponseHelper.error(res, 'Failed to fetch models');
        }
    }

    /**
     * Get model by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const model = await prisma.model.findFirst({
                where: { id, deletedAt: null },
            });

            if (!model) {
                return ResponseHelper.notFound(res, 'Model not found');
            }

            return ResponseHelper.success(res, model, 'Model retrieved successfully');
        } catch (error) {
            console.error('Error fetching model:', error);
            return ResponseHelper.error(res, 'Failed to fetch model');
        }
    }

    /**
     * Create new model
     */
    async create(req, res) {
        try {
            const { modelName } = req.body;

            if (!modelName) {
                return ResponseHelper.badRequest(res, 'Model name is required');
            }

            const model = await prisma.model.create({
                data: { modelName },
            });

            return ResponseHelper.created(res, model, 'Model created successfully');
        } catch (error) {
            console.error('Error creating model:', error);
            return ResponseHelper.error(res, 'Failed to create model');
        }
    }

    /**
     * Update model
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { modelName } = req.body;

            const existingModel = await prisma.model.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingModel) {
                return ResponseHelper.notFound(res, 'Model not found');
            }

            const model = await prisma.model.update({
                where: { id },
                data: { modelName },
            });

            return ResponseHelper.success(res, model, 'Model updated successfully');
        } catch (error) {
            console.error('Error updating model:', error);
            return ResponseHelper.error(res, 'Failed to update model');
        }
    }

    /**
     * Soft delete model
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingModel = await prisma.model.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingModel) {
                return ResponseHelper.notFound(res, 'Model not found');
            }

            await prisma.model.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Model deleted successfully');
        } catch (error) {
            console.error('Error deleting model:', error);
            return ResponseHelper.error(res, 'Failed to delete model');
        }
    }
}

module.exports = new ModelController();
