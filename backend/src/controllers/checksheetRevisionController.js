const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class ChecksheetRevisionController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, referenceType = '', referenceId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(referenceType && { referenceType }),
                ...(referenceId && { referenceId }),
            };

            const [revisions, total] = await Promise.all([
                prisma.checksheetRevision.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        revisedByUser: {
                            select: { id: true, fullName: true, email: true, role: true },
                        },
                    },
                }),
                prisma.checksheetRevision.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, revisions, pagination, 'Revisions retrieved successfully');
        } catch (error) {
            console.error('Error fetching revisions:', error);
            return ResponseHelper.error(res, 'Failed to fetch revisions');
        }
    }

    async getByReference(req, res) {
        try {
            const { referenceType, referenceId } = req.params;

            const revisions = await prisma.checksheetRevision.findMany({
                where: { referenceType, referenceId, deletedAt: null },
                orderBy: { revisionNumber: 'desc' },
                include: {
                    revisedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            return ResponseHelper.success(res, revisions, 'Revisions retrieved successfully');
        } catch (error) {
            console.error('Error fetching revisions:', error);
            return ResponseHelper.error(res, 'Failed to fetch revisions');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const revision = await prisma.checksheetRevision.findFirst({
                where: { id, deletedAt: null },
                include: {
                    revisedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            if (!revision) {
                return ResponseHelper.notFound(res, 'Revision not found');
            }

            return ResponseHelper.success(res, revision, 'Revision retrieved successfully');
        } catch (error) {
            console.error('Error fetching revision:', error);
            return ResponseHelper.error(res, 'Failed to fetch revision');
        }
    }

    async create(req, res) {
        try {
            const { referenceType, referenceId, revisionNote, revisedBy } = req.body;

            if (!referenceType || !referenceId || !revisionNote || !revisedBy) {
                return ResponseHelper.badRequest(res, 'All fields are required');
            }

            const validTypes = ['dir', 'fi'];
            if (!validTypes.includes(referenceType)) {
                return ResponseHelper.badRequest(res, 'Invalid reference type. Must be dir or fi');
            }

            // Get next revision number
            const lastRevision = await prisma.checksheetRevision.findFirst({
                where: { referenceType, referenceId },
                orderBy: { revisionNumber: 'desc' },
            });

            const revisionNumber = lastRevision ? lastRevision.revisionNumber + 1 : 1;

            const revision = await prisma.checksheetRevision.create({
                data: {
                    referenceType,
                    referenceId,
                    revisionNumber,
                    revisionNote,
                    revisedBy,
                },
                include: {
                    revisedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            return ResponseHelper.created(res, revision, 'Revision created successfully');
        } catch (error) {
            console.error('Error creating revision:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid user reference');
            }
            return ResponseHelper.error(res, 'Failed to create revision');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { revisionNote } = req.body;

            const existingRevision = await prisma.checksheetRevision.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingRevision) {
                return ResponseHelper.notFound(res, 'Revision not found');
            }

            const revision = await prisma.checksheetRevision.update({
                where: { id },
                data: { ...(revisionNote && { revisionNote }) },
                include: {
                    revisedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            return ResponseHelper.success(res, revision, 'Revision updated successfully');
        } catch (error) {
            console.error('Error updating revision:', error);
            return ResponseHelper.error(res, 'Failed to update revision');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingRevision = await prisma.checksheetRevision.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingRevision) {
                return ResponseHelper.notFound(res, 'Revision not found');
            }

            await prisma.checksheetRevision.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Revision deleted successfully');
        } catch (error) {
            console.error('Error deleting revision:', error);
            return ResponseHelper.error(res, 'Failed to delete revision');
        }
    }
}

module.exports = new ChecksheetRevisionController();
