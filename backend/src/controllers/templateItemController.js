const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class TemplateItemController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, templateId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(templateId && { templateId }),
            };

            const [items, total] = await Promise.all([
                prisma.templateItem.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { sequence: 'asc' },
                    include: {
                        template: {
                            select: { id: true, templateCode: true, templateName: true },
                        },
                    },
                }),
                prisma.templateItem.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, items, pagination, 'Template items retrieved successfully');
        } catch (error) {
            console.error('Error fetching template items:', error);
            return ResponseHelper.error(res, 'Failed to fetch template items');
        }
    }

    async getByTemplateId(req, res) {
        try {
            const { templateId } = req.params;

            const items = await prisma.templateItem.findMany({
                where: { templateId, deletedAt: null },
                orderBy: { sequence: 'asc' },
            });

            return ResponseHelper.success(res, items, 'Template items retrieved successfully');
        } catch (error) {
            console.error('Error fetching template items:', error);
            return ResponseHelper.error(res, 'Failed to fetch template items');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const item = await prisma.templateItem.findFirst({
                where: { id, deletedAt: null },
                include: {
                    template: {
                        select: { id: true, templateCode: true, templateName: true },
                    },
                },
            });

            if (!item) {
                return ResponseHelper.notFound(res, 'Template item not found');
            }

            return ResponseHelper.success(res, item, 'Template item retrieved successfully');
        } catch (error) {
            console.error('Error fetching template item:', error);
            return ResponseHelper.error(res, 'Failed to fetch template item');
        }
    }

    async create(req, res) {
        try {
            const { templateId, itemName, nominal, toleranceMin, toleranceMax, sequence } = req.body;

            if (!templateId || !itemName || sequence === undefined) {
                return ResponseHelper.badRequest(res, 'Template ID, item name and sequence are required');
            }

            const item = await prisma.templateItem.create({
                data: {
                    templateId,
                    itemName,
                    nominal: nominal ? parseFloat(nominal) : null,
                    toleranceMin: toleranceMin ? parseFloat(toleranceMin) : null,
                    toleranceMax: toleranceMax ? parseFloat(toleranceMax) : null,
                    sequence: parseInt(sequence),
                },
            });

            return ResponseHelper.created(res, item, 'Template item created successfully');
        } catch (error) {
            console.error('Error creating template item:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid template reference');
            }
            return ResponseHelper.error(res, 'Failed to create template item');
        }
    }

    async createBulk(req, res) {
        try {
            const { templateId, items } = req.body;

            if (!templateId || !items || !Array.isArray(items) || items.length === 0) {
                return ResponseHelper.badRequest(res, 'Template ID and items array are required');
            }

            const itemsData = items.map((item, index) => ({
                templateId,
                itemName: item.itemName,
                nominal: item.nominal ? parseFloat(item.nominal) : null,
                toleranceMin: item.toleranceMin ? parseFloat(item.toleranceMin) : null,
                toleranceMax: item.toleranceMax ? parseFloat(item.toleranceMax) : null,
                sequence: item.sequence !== undefined ? parseInt(item.sequence) : index + 1,
            }));

            const result = await prisma.templateItem.createMany({
                data: itemsData,
            });

            return ResponseHelper.created(res, { count: result.count }, `${result.count} template items created successfully`);
        } catch (error) {
            console.error('Error creating template items:', error);
            return ResponseHelper.error(res, 'Failed to create template items');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { itemName, nominal, toleranceMin, toleranceMax, sequence } = req.body;

            const existingItem = await prisma.templateItem.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingItem) {
                return ResponseHelper.notFound(res, 'Template item not found');
            }

            const item = await prisma.templateItem.update({
                where: { id },
                data: {
                    ...(itemName && { itemName }),
                    ...(nominal !== undefined && { nominal: nominal ? parseFloat(nominal) : null }),
                    ...(toleranceMin !== undefined && { toleranceMin: toleranceMin ? parseFloat(toleranceMin) : null }),
                    ...(toleranceMax !== undefined && { toleranceMax: toleranceMax ? parseFloat(toleranceMax) : null }),
                    ...(sequence !== undefined && { sequence: parseInt(sequence) }),
                },
            });

            return ResponseHelper.success(res, item, 'Template item updated successfully');
        } catch (error) {
            console.error('Error updating template item:', error);
            return ResponseHelper.error(res, 'Failed to update template item');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingItem = await prisma.templateItem.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingItem) {
                return ResponseHelper.notFound(res, 'Template item not found');
            }

            await prisma.templateItem.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Template item deleted successfully');
        } catch (error) {
            console.error('Error deleting template item:', error);
            return ResponseHelper.error(res, 'Failed to delete template item');
        }
    }
}

module.exports = new TemplateItemController();
