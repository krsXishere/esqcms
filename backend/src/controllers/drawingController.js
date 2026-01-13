const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class DrawingController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', modelId = '', partId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(modelId && { modelId }),
                ...(partId && { partId }),
                ...(search && {
                    OR: [
                        { fileName: { contains: search, mode: 'insensitive' } },
                        { version: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };

            const [drawings, total] = await Promise.all([
                prisma.drawing.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        model: true,
                        part: true,
                    },
                }),
                prisma.drawing.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, drawings, pagination, 'Drawings retrieved successfully');
        } catch (error) {
            console.error('Error fetching drawings:', error);
            return ResponseHelper.error(res, 'Failed to fetch drawings');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const drawing = await prisma.drawing.findFirst({
                where: { id, deletedAt: null },
                include: {
                    model: true,
                    part: true,
                },
            });

            if (!drawing) {
                return ResponseHelper.notFound(res, 'Drawing not found');
            }

            return ResponseHelper.success(res, drawing, 'Drawing retrieved successfully');
        } catch (error) {
            console.error('Error fetching drawing:', error);
            return ResponseHelper.error(res, 'Failed to fetch drawing');
        }
    }

    async create(req, res) {
        try {
            const { modelId, partId, fileName, filePath, fileType, version } = req.body;

            if (!modelId || !partId || !fileName || !filePath || !fileType || !version) {
                return ResponseHelper.badRequest(res, 'All fields are required');
            }

            const drawing = await prisma.drawing.create({
                data: { modelId, partId, fileName, filePath, fileType, version },
                include: {
                    model: true,
                    part: true,
                },
            });

            return ResponseHelper.created(res, drawing, 'Drawing created successfully');
        } catch (error) {
            console.error('Error creating drawing:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid model or part reference');
            }
            return ResponseHelper.error(res, 'Failed to create drawing');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { modelId, partId, fileName, filePath, fileType, version } = req.body;

            const existingDrawing = await prisma.drawing.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingDrawing) {
                return ResponseHelper.notFound(res, 'Drawing not found');
            }

            const drawing = await prisma.drawing.update({
                where: { id },
                data: {
                    ...(modelId && { modelId }),
                    ...(partId && { partId }),
                    ...(fileName && { fileName }),
                    ...(filePath && { filePath }),
                    ...(fileType && { fileType }),
                    ...(version && { version }),
                },
                include: {
                    model: true,
                    part: true,
                },
            });

            return ResponseHelper.success(res, drawing, 'Drawing updated successfully');
        } catch (error) {
            console.error('Error updating drawing:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid model or part reference');
            }
            return ResponseHelper.error(res, 'Failed to update drawing');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingDrawing = await prisma.drawing.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingDrawing) {
                return ResponseHelper.notFound(res, 'Drawing not found');
            }

            await prisma.drawing.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Drawing deleted successfully');
        } catch (error) {
            console.error('Error deleting drawing:', error);
            return ResponseHelper.error(res, 'Failed to delete drawing');
        }
    }
}

module.exports = new DrawingController();
