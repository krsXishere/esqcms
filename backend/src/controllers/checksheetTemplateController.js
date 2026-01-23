const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const codeGenerator = require('../utils/codeGenerator');

class ChecksheetTemplateController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', type = '', status = '', modelId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(type && { type }),
                ...(status && { status }),
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

            // Format response to match frontend expectations
            const formattedTemplates = templates.map(t => ({
                id: t.id,
                name: t.templateName,
                code: t.templateCode,
                type: t.type === 'dir' ? 'In Process' : 'Final',
                fields: t._count.templateItems,
                lastModified: t.updatedAt?.toISOString().split('T')[0] || t.createdAt.toISOString().split('T')[0],
                status: t.status,
                // Original data for backward compatibility
                templateCode: t.templateCode,
                templateName: t.templateName,
                description: t.description,
                model: t.model,
                part: t.part,
                modelId: t.modelId,
                partId: t.partId,
                rawType: t.type,
            }));

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, formattedTemplates, pagination, 'Templates retrieved successfully');
        } catch (error) {
            console.error('Error fetching templates:', error);
            return ResponseHelper.error(res, 'Failed to fetch templates');
        }
    }

    /**
     * GET /checksheet-templates/stats
     * Returns template counts by status for dashboard stats cards
     */
    async getStats(req, res) {
        try {
            const [total, active, draft, inactive] = await Promise.all([
                prisma.checksheetTemplate.count({ where: { deletedAt: null } }),
                prisma.checksheetTemplate.count({ where: { deletedAt: null, status: 'active' } }),
                prisma.checksheetTemplate.count({ where: { deletedAt: null, status: 'draft' } }),
                prisma.checksheetTemplate.count({ where: { deletedAt: null, status: 'inactive' } }),
            ]);

            return ResponseHelper.success(res, {
                total,
                active,
                draft,
                inactive,
            }, 'Template stats retrieved successfully');
        } catch (error) {
            console.error('Error fetching template stats:', error);
            return ResponseHelper.error(res, 'Failed to fetch template stats');
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
            const { templateName, type, modelId, partId, description, status = 'draft' } = req.body;

            if (!templateName || !type || !modelId || !partId || !description) {
                return ResponseHelper.badRequest(res, 'All fields are required');
            }

            const validTypes = ['dir', 'fi'];
            if (!validTypes.includes(type)) {
                return ResponseHelper.badRequest(res, 'Invalid type. Must be dir or fi');
            }

            const validStatuses = ['active', 'draft', 'inactive'];
            if (!validStatuses.includes(status)) {
                return ResponseHelper.badRequest(res, 'Invalid status. Must be active, draft, or inactive');
            }

            const templateCode = codeGenerator.generateTemplateCode();

            const template = await prisma.checksheetTemplate.create({
                data: { templateCode, templateName, type, modelId, partId, description, status },
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
            const { templateName, type, modelId, partId, description, status } = req.body;

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

            if (status) {
                const validStatuses = ['active', 'draft', 'inactive'];
                if (!validStatuses.includes(status)) {
                    return ResponseHelper.badRequest(res, 'Invalid status. Must be active, draft, or inactive');
                }
            }

            const template = await prisma.checksheetTemplate.update({
                where: { id },
                data: {
                    ...(templateName && { templateName }),
                    ...(type && { type }),
                    ...(modelId && { modelId }),
                    ...(partId && { partId }),
                    ...(description && { description }),
                    ...(status && { status }),
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
