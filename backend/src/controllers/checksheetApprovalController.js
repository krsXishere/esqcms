const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class ChecksheetApprovalController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, referenceType = '', referenceId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(referenceType && { referenceType }),
                ...(referenceId && { referenceId }),
            };

            const [approvals, total] = await Promise.all([
                prisma.checksheetApproval.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { approvedAt: 'desc' },
                    include: {
                        approvedByUser: {
                            select: { id: true, fullName: true, email: true, role: true },
                        },
                    },
                }),
                prisma.checksheetApproval.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, approvals, pagination, 'Approvals retrieved successfully');
        } catch (error) {
            console.error('Error fetching approvals:', error);
            return ResponseHelper.error(res, 'Failed to fetch approvals');
        }
    }

    async getByReference(req, res) {
        try {
            const { referenceType, referenceId } = req.params;

            const approvals = await prisma.checksheetApproval.findMany({
                where: { referenceType, referenceId, deletedAt: null },
                orderBy: { approvedAt: 'desc' },
                include: {
                    approvedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            return ResponseHelper.success(res, approvals, 'Approvals retrieved successfully');
        } catch (error) {
            console.error('Error fetching approvals:', error);
            return ResponseHelper.error(res, 'Failed to fetch approvals');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const approval = await prisma.checksheetApproval.findFirst({
                where: { id, deletedAt: null },
                include: {
                    approvedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            if (!approval) {
                return ResponseHelper.notFound(res, 'Approval not found');
            }

            return ResponseHelper.success(res, approval, 'Approval retrieved successfully');
        } catch (error) {
            console.error('Error fetching approval:', error);
            return ResponseHelper.error(res, 'Failed to fetch approval');
        }
    }

    async create(req, res) {
        try {
            const { referenceType, referenceId, approvedBy, note } = req.body;

            if (!referenceType || !referenceId || !approvedBy) {
                return ResponseHelper.badRequest(res, 'Reference type, reference ID and approver are required');
            }

            const validTypes = ['dir', 'fi'];
            if (!validTypes.includes(referenceType)) {
                return ResponseHelper.badRequest(res, 'Invalid reference type. Must be dir or fi');
            }

            const approval = await prisma.checksheetApproval.create({
                data: {
                    referenceType,
                    referenceId,
                    approvedBy,
                    approvedAt: new Date(),
                    note,
                },
                include: {
                    approvedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            return ResponseHelper.created(res, approval, 'Approval created successfully');
        } catch (error) {
            console.error('Error creating approval:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid user reference');
            }
            return ResponseHelper.error(res, 'Failed to create approval');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { note } = req.body;

            const existingApproval = await prisma.checksheetApproval.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingApproval) {
                return ResponseHelper.notFound(res, 'Approval not found');
            }

            const approval = await prisma.checksheetApproval.update({
                where: { id },
                data: { ...(note !== undefined && { note }) },
                include: {
                    approvedByUser: {
                        select: { id: true, fullName: true, email: true, role: true },
                    },
                },
            });

            return ResponseHelper.success(res, approval, 'Approval updated successfully');
        } catch (error) {
            console.error('Error updating approval:', error);
            return ResponseHelper.error(res, 'Failed to update approval');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingApproval = await prisma.checksheetApproval.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingApproval) {
                return ResponseHelper.notFound(res, 'Approval not found');
            }

            await prisma.checksheetApproval.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Approval deleted successfully');
        } catch (error) {
            console.error('Error deleting approval:', error);
            return ResponseHelper.error(res, 'Failed to delete approval');
        }
    }
}

module.exports = new ChecksheetApprovalController();
