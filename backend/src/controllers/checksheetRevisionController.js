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

    /**
     * Get current revisions (DIRs/FIs with status 'revision')
     * GET /api/revisions/current
     * Filters: search, priority, inspector, requestedBy
     */
    async getCurrentRevisions(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                priority = '',
                inspector = '',
                requestedBy = '',
                referenceType = '' // 'dir' or 'fi'
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Build where conditions for DIRs
            const dirWhere = {
                status: 'revision',
                deletedAt: null,
                ...(search && {
                    OR: [
                        { idDir: { contains: search, mode: 'insensitive' } },
                        { drawingNo: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(inspector && {
                    operator: {
                        fullName: { contains: inspector, mode: 'insensitive' }
                    }
                }),
            };

            // Build where conditions for FIs
            const fiWhere = {
                status: 'revision',
                deletedAt: null,
                ...(search && {
                    OR: [
                        { idFi: { contains: search, mode: 'insensitive' } },
                        { fiNumber: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(inspector && {
                    operator: {
                        fullName: { contains: inspector, mode: 'insensitive' }
                    }
                }),
            };

            // Fetch DIRs and FIs in revision
            const [dirs, fis] = await Promise.all([
                (!referenceType || referenceType === 'dir') ? prisma.dir.findMany({
                    where: dirWhere,
                    include: {
                        model: { select: { id: true, modelName: true } },
                        operator: { select: { id: true, fullName: true, email: true } },
                    },
                    orderBy: { updatedAt: 'desc' },
                }) : [],
                (!referenceType || referenceType === 'fi') ? prisma.fi.findMany({
                    where: fiWhere,
                    include: {
                        model: { select: { id: true, modelName: true } },
                        operator: { select: { id: true, fullName: true, email: true } },
                    },
                    orderBy: { updatedAt: 'desc' },
                }) : [],
            ]);

            // Get revision details for each checksheet
            const dirIds = dirs.map(d => d.id);
            const fiIds = fis.map(f => f.id);

            const [dirRevisions, fiRevisions] = await Promise.all([
                dirIds.length > 0 ? prisma.checksheetRevision.findMany({
                    where: {
                        referenceType: 'dir',
                        referenceId: { in: dirIds },
                        deletedAt: null,
                    },
                    include: {
                        revisedByUser: { select: { id: true, fullName: true, email: true } },
                    },
                    orderBy: { revisionNumber: 'desc' },
                }) : [],
                fiIds.length > 0 ? prisma.checksheetRevision.findMany({
                    where: {
                        referenceType: 'fi',
                        referenceId: { in: fiIds },
                        deletedAt: null,
                    },
                    include: {
                        revisedByUser: { select: { id: true, fullName: true, email: true } },
                    },
                    orderBy: { revisionNumber: 'desc' },
                }) : [],
            ]);

            // Map revisions by referenceId
            const revisionMap = {};
            [...dirRevisions, ...fiRevisions].forEach(rev => {
                if (!revisionMap[rev.referenceId]) {
                    revisionMap[rev.referenceId] = rev;
                }
            });

            // Transform DIRs
            const transformedDirs = dirs.map(dir => {
                const revision = revisionMap[dir.id];
                return {
                    id: dir.id,
                    no: dir.idDir,
                    type: 'DIR',
                    model: dir.model?.modelName || '-',
                    inspector: dir.operator?.fullName || '-',
                    inspectorEmail: dir.operator?.email,
                    reason: revision?.revisionNote || '-',
                    requestedBy: revision?.revisedByUser?.fullName || '-',
                    requestedByEmail: revision?.revisedByUser?.email,
                    status: 'revision',
                    date: dir.updatedAt,
                    priority: 'medium', // Default priority
                    revisionNumber: revision?.revisionNumber || 0,
                };
            });

            // Transform FIs
            const transformedFis = fis.map(fi => {
                const revision = revisionMap[fi.id];
                return {
                    id: fi.id,
                    no: fi.idFi,
                    type: 'FI',
                    model: fi.model?.modelName || '-',
                    inspector: fi.operator?.fullName || '-',
                    inspectorEmail: fi.operator?.email,
                    reason: revision?.revisionNote || '-',
                    requestedBy: revision?.revisedByUser?.fullName || '-',
                    requestedByEmail: revision?.revisedByUser?.email,
                    status: 'revision',
                    date: fi.updatedAt,
                    priority: 'medium', // Default priority
                    revisionNumber: revision?.revisionNumber || 0,
                };
            });

            // Combine and filter by requestedBy if provided
            let combined = [...transformedDirs, ...transformedFis];

            if (requestedBy) {
                combined = combined.filter(item =>
                    item.requestedBy.toLowerCase().includes(requestedBy.toLowerCase())
                );
            }

            // Sort by date descending
            combined.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Apply pagination
            const total = combined.length;
            const paginatedData = combined.slice(skip, skip + parseInt(limit));

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, paginatedData, pagination, 'Current revisions retrieved successfully');
        } catch (error) {
            console.error('Error fetching current revisions:', error);
            return ResponseHelper.error(res, 'Failed to fetch current revisions');
        }
    }

    /**
     * Get revision history (completed revisions)
     * GET /api/revisions/history
     * Shows DIRs/FIs that were revised and now approved/checked
     */
    async getRevisionHistory(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                referenceType = '' // 'dir' or 'fi'
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Get all revisions with their checksheet details
            const where = {
                deletedAt: null,
                ...(referenceType && { referenceType }),
            };

            const revisions = await prisma.checksheetRevision.findMany({
                where,
                include: {
                    revisedByUser: { select: { id: true, fullName: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            // Get DIRs and FIs that have been revised and are now approved/checked
            const dirIds = revisions
                .filter(r => r.referenceType === 'dir')
                .map(r => r.referenceId);

            const fiIds = revisions
                .filter(r => r.referenceType === 'fi')
                .map(r => r.referenceId);

            const [dirs, fis] = await Promise.all([
                dirIds.length > 0 ? prisma.dir.findMany({
                    where: {
                        id: { in: dirIds },
                        status: { in: ['checked', 'approved'] },
                        deletedAt: null,
                    },
                    include: {
                        model: { select: { id: true, modelName: true } },
                        operator: { select: { id: true, fullName: true, email: true } },
                    },
                }) : [],
                fiIds.length > 0 ? prisma.fi.findMany({
                    where: {
                        id: { in: fiIds },
                        status: { in: ['checked', 'approved'] },
                        deletedAt: null,
                    },
                    include: {
                        model: { select: { id: true, modelName: true } },
                        operator: { select: { id: true, fullName: true, email: true } },
                    },
                }) : [],
            ]);

            // Create maps for quick lookup
            const dirMap = {};
            dirs.forEach(dir => { dirMap[dir.id] = dir; });

            const fiMap = {};
            fis.forEach(fi => { fiMap[fi.id] = fi; });

            // Transform data
            const historyData = [];

            for (const revision of revisions) {
                let checksheet = null;
                let type = '';
                let no = '';

                if (revision.referenceType === 'dir') {
                    checksheet = dirMap[revision.referenceId];
                    type = 'DIR';
                    no = checksheet?.idDir;
                } else {
                    checksheet = fiMap[revision.referenceId];
                    type = 'FI';
                    no = checksheet?.idFi;
                }

                if (checksheet) {
                    // Calculate duration
                    const revisedAt = new Date(revision.createdAt);
                    const completedAt = new Date(checksheet.updatedAt);
                    const durationMs = completedAt - revisedAt;
                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    const duration = `${hours}h ${minutes}m`;

                    historyData.push({
                        id: revision.id,
                        checksheetId: checksheet.id,
                        no,
                        type,
                        model: checksheet.model?.modelName || '-',
                        inspector: checksheet.operator?.fullName || '-',
                        inspectorEmail: checksheet.operator?.email,
                        reason: revision.revisionNote,
                        requestedBy: revision.revisedByUser?.fullName || '-',
                        requestedByEmail: revision.revisedByUser?.email,
                        revisedAt: revision.createdAt,
                        completedAt: checksheet.updatedAt,
                        duration,
                        durationMs,
                        status: checksheet.status,
                        revisionNumber: revision.revisionNumber,
                    });
                }
            }

            // Filter by search
            let filtered = historyData;
            if (search) {
                filtered = historyData.filter(item =>
                    item.no?.toLowerCase().includes(search.toLowerCase()) ||
                    item.model?.toLowerCase().includes(search.toLowerCase()) ||
                    item.inspector?.toLowerCase().includes(search.toLowerCase())
                );
            }

            // Sort by completedAt descending
            filtered.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

            // Apply pagination
            const total = filtered.length;
            const paginatedData = filtered.slice(skip, skip + parseInt(limit));

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, paginatedData, pagination, 'Revision history retrieved successfully');
        } catch (error) {
            console.error('Error fetching revision history:', error);
            return ResponseHelper.error(res, 'Failed to fetch revision history');
        }
    }
}

module.exports = new ChecksheetRevisionController();
