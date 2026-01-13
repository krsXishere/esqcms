const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class RejectReasonController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { reasonCode: { contains: search, mode: 'insensitive' } },
                        { reasonName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };

            const [rejectReasons, total] = await Promise.all([
                prisma.rejectReason.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.rejectReason.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, rejectReasons, pagination, 'Reject reasons retrieved successfully');
        } catch (error) {
            console.error('Error fetching reject reasons:', error);
            return ResponseHelper.error(res, 'Failed to fetch reject reasons');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const rejectReason = await prisma.rejectReason.findFirst({
                where: { id, deletedAt: null },
            });

            if (!rejectReason) {
                return ResponseHelper.notFound(res, 'Reject reason not found');
            }

            return ResponseHelper.success(res, rejectReason, 'Reject reason retrieved successfully');
        } catch (error) {
            console.error('Error fetching reject reason:', error);
            return ResponseHelper.error(res, 'Failed to fetch reject reason');
        }
    }

    async create(req, res) {
        try {
            const { reasonCode, reasonName, description } = req.body;

            if (!reasonCode || !reasonName || !description) {
                return ResponseHelper.badRequest(res, 'Reason code, name and description are required');
            }

            const rejectReason = await prisma.rejectReason.create({
                data: { reasonCode, reasonName, description },
            });

            return ResponseHelper.created(res, rejectReason, 'Reject reason created successfully');
        } catch (error) {
            console.error('Error creating reject reason:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Reason code already exists');
            }
            return ResponseHelper.error(res, 'Failed to create reject reason');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { reasonCode, reasonName, description } = req.body;

            const existingReason = await prisma.rejectReason.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingReason) {
                return ResponseHelper.notFound(res, 'Reject reason not found');
            }

            const rejectReason = await prisma.rejectReason.update({
                where: { id },
                data: {
                    ...(reasonCode && { reasonCode }),
                    ...(reasonName && { reasonName }),
                    ...(description && { description }),
                },
            });

            return ResponseHelper.success(res, rejectReason, 'Reject reason updated successfully');
        } catch (error) {
            console.error('Error updating reject reason:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Reason code already exists');
            }
            return ResponseHelper.error(res, 'Failed to update reject reason');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingReason = await prisma.rejectReason.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingReason) {
                return ResponseHelper.notFound(res, 'Reject reason not found');
            }

            await prisma.rejectReason.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Reject reason deleted successfully');
        } catch (error) {
            console.error('Error deleting reject reason:', error);
            return ResponseHelper.error(res, 'Failed to delete reject reason');
        }
    }
}

module.exports = new RejectReasonController();
