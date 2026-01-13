const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class SectionController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { sectionCode: { contains: search, mode: 'insensitive' } },
                        { sectionName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };

            const [sections, total] = await Promise.all([
                prisma.section.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.section.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, sections, pagination, 'Sections retrieved successfully');
        } catch (error) {
            console.error('Error fetching sections:', error);
            return ResponseHelper.error(res, 'Failed to fetch sections');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const section = await prisma.section.findFirst({
                where: { id, deletedAt: null },
            });

            if (!section) {
                return ResponseHelper.notFound(res, 'Section not found');
            }

            return ResponseHelper.success(res, section, 'Section retrieved successfully');
        } catch (error) {
            console.error('Error fetching section:', error);
            return ResponseHelper.error(res, 'Failed to fetch section');
        }
    }

    async create(req, res) {
        try {
            const { sectionCode, sectionName } = req.body;

            if (!sectionCode || !sectionName) {
                return ResponseHelper.badRequest(res, 'Section code and name are required');
            }

            const section = await prisma.section.create({
                data: { sectionCode, sectionName },
            });

            return ResponseHelper.created(res, section, 'Section created successfully');
        } catch (error) {
            console.error('Error creating section:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Section code already exists');
            }
            return ResponseHelper.error(res, 'Failed to create section');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { sectionCode, sectionName } = req.body;

            const existingSection = await prisma.section.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingSection) {
                return ResponseHelper.notFound(res, 'Section not found');
            }

            const section = await prisma.section.update({
                where: { id },
                data: {
                    ...(sectionCode && { sectionCode }),
                    ...(sectionName && { sectionName }),
                },
            });

            return ResponseHelper.success(res, section, 'Section updated successfully');
        } catch (error) {
            console.error('Error updating section:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Section code already exists');
            }
            return ResponseHelper.error(res, 'Failed to update section');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingSection = await prisma.section.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingSection) {
                return ResponseHelper.notFound(res, 'Section not found');
            }

            await prisma.section.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Section deleted successfully');
        } catch (error) {
            console.error('Error deleting section:', error);
            return ResponseHelper.error(res, 'Failed to delete section');
        }
    }
}

module.exports = new SectionController();
