const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class ChecksheetTemplateController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', type = '', modelId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(type && { type }),
                ...(modelId && { modelId }),
                ...(search && {
                    OR: [
                        { templateCode: { contains: search, mode: 'insensitive' } },
                        { templateName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };

            const [templates, total] = await Promise.all([
                prisma.checksheetTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        model: true,
                        part: true,
                        _count: { select: { templateItems: true } },
                    },
                }),
                prisma.checksheetTemplate.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, templates, pagination, 'Templates retrieved successfully');
        } catch (error) {
            console.error('Error fetching templates:', error);
            return ResponseHelper.error(res, 'Failed to fetch templates');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const template = await prisma.checksheetTemplate.findFirst({
                where: { id, deletedAt: null },
                include: {
                    model: true,
                    part: true,
                    templateItems: {
                        where: { deletedAt: null },
                        orderBy: { sequence: 'asc' },
                    },
                },
            });

            if (!template) {
                return ResponseHelper.notFound(res, 'Template not found');
            }

            return ResponseHelper.success(res, template, 'Template retrieved successfully');
        } catch (error) {
            console.error('Error fetching template:', error);
            return ResponseHelper.error(res, 'Failed to fetch template');
        }
    }

    async create(req, res) {
        try {
            const { templateCode, templateName, type, modelId, partId, description } = req.body;

            if (!templateCode || !templateName || !type || !modelId || !partId || !description) {
                return ResponseHelper.badRequest(res, 'All fields are required');
            }

            const validTypes = ['dir', 'fi'];
            if (!validTypes.includes(type)) {
                return ResponseHelper.badRequest(res, 'Invalid type. Must be dir or fi');
            }

            const template = await prisma.checksheetTemplate.create({
                data: { templateCode, templateName, type, modelId, partId, description },
                include: {
                    model: true,
                    part: true,
                },
            });

            return ResponseHelper.created(res, template, 'Template created successfully');
        } catch (error) {
            console.error('Error creating template:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Template code already exists');
            }
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid model or part reference');
            }
            return ResponseHelper.error(res, 'Failed to create template');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { templateCode, templateName, type, modelId, partId, description } = req.body;

            const existingTemplate = await prisma.checksheetTemplate.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingTemplate) {
                return ResponseHelper.notFound(res, 'Template not found');
            }

            if (type) {
                const validTypes = ['dir', 'fi'];
                if (!validTypes.includes(type)) {
                    return ResponseHelper.badRequest(res, 'Invalid type. Must be dir or fi');
                }
            }

            const template = await prisma.checksheetTemplate.update({
                where: { id },
                data: {
                    ...(templateCode && { templateCode }),
                    ...(templateName && { templateName }),
                    ...(type && { type }),
                    ...(modelId && { modelId }),
                    ...(partId && { partId }),
                    ...(description && { description }),
                },
                include: {
                    model: true,
                    part: true,
                },
            });

            return ResponseHelper.success(res, template, 'Template updated successfully');
        } catch (error) {
            console.error('Error updating template:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Template code already exists');
            }
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid model or part reference');
            }
            return ResponseHelper.error(res, 'Failed to update template');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingTemplate = await prisma.checksheetTemplate.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingTemplate) {
                return ResponseHelper.notFound(res, 'Template not found');
            }

            await prisma.checksheetTemplate.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Template deleted successfully');
        } catch (error) {
            console.error('Error deleting template:', error);
            return ResponseHelper.error(res, 'Failed to delete template');
        }
    }
}

module.exports = new ChecksheetTemplateController();
