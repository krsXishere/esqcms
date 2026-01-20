/**
 * Dashboard Controller
 * Aggregated/summary data for role-based dashboards
 * READ ONLY - No CRUD operations
 */

const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class DashboardController {
    // ========================
    // 1️⃣ DASHBOARD INSPECTOR
    // ========================
    /**
     * GET /dashboard/inspector
     * Shows summary for inspector's own checksheets
     */
    async getInspectorDashboard(req, res) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            // Role check
            if (userRole !== 'inspector') {
                return ResponseHelper.error(res, 'Access denied. Inspector role required.', 403);
            }

            const [
                // DIR counts by status
                dirPending,
                dirRevision,
                dirChecked,
                dirApproved,
                totalDir,
                // FI counts by status
                fiPending,
                fiRevision,
                fiChecked,
                fiApproved,
                totalFi,
                // Recent DIRs
                recentDirs,
                // Recent FIs
                recentFis,
            ] = await Promise.all([
                // DIR counts
                prisma.dir.count({ where: { operatorId: userId, status: 'pending', deletedAt: null } }),
                prisma.dir.count({ where: { operatorId: userId, status: 'revision', deletedAt: null } }),
                prisma.dir.count({ where: { operatorId: userId, status: 'checked', deletedAt: null } }),
                prisma.dir.count({ where: { operatorId: userId, status: 'approved', deletedAt: null } }),
                prisma.dir.count({ where: { operatorId: userId, deletedAt: null } }),
                // FI counts
                prisma.fi.count({ where: { operatorId: userId, status: 'pending', deletedAt: null } }),
                prisma.fi.count({ where: { operatorId: userId, status: 'revision', deletedAt: null } }),
                prisma.fi.count({ where: { operatorId: userId, status: 'checked', deletedAt: null } }),
                prisma.fi.count({ where: { operatorId: userId, status: 'approved', deletedAt: null } }),
                prisma.fi.count({ where: { operatorId: userId, deletedAt: null } }),
                // Recent DIRs (last 5)
                prisma.dir.findMany({
                    where: { operatorId: userId, deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        idDir: true,
                        status: true,
                        serialNumber: true,
                        createdAt: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                        part: { select: { partName: true } },
                    },
                }),
                // Recent FIs (last 5)
                prisma.fi.findMany({
                    where: { operatorId: userId, deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        idFi: true,
                        fiNumber: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                    },
                }),
            ]);

            const response = {
                summary: {
                    totalChecksheets: totalDir + totalFi,
                    totalDir,
                    totalFi,
                },
                metrics: {
                    dir: {
                        pending: dirPending,
                        revision: dirRevision,
                        checked: dirChecked,
                        approved: dirApproved,
                    },
                    fi: {
                        pending: fiPending,
                        revision: fiRevision,
                        checked: fiChecked,
                        approved: fiApproved,
                    },
                    pendingValidation: dirPending + fiPending,
                    revisionReturned: dirRevision + fiRevision,
                    approvedCount: dirApproved + fiApproved,
                },
                recentActivity: {
                    dirs: recentDirs.map(d => ({
                        id: d.id,
                        code: d.idDir,
                        type: 'DIR',
                        status: d.status,
                        serialNumber: d.serialNumber,
                        model: d.model?.modelName,
                        part: d.part?.partName,
                        createdAt: d.createdAt,
                        updatedAt: d.updatedAt,
                    })),
                    fis: recentFis.map(f => ({
                        id: f.id,
                        code: f.idFi,
                        type: 'FI',
                        fiNumber: f.fiNumber,
                        status: f.status,
                        model: f.model?.modelName,
                        createdAt: f.createdAt,
                        updatedAt: f.updatedAt,
                    })),
                },
            };

            return ResponseHelper.success(res, response, 'Inspector dashboard retrieved successfully');
        } catch (error) {
            console.error('Error fetching inspector dashboard:', error);
            return ResponseHelper.error(res, 'Failed to fetch inspector dashboard', 500);
        }
    }

    // ========================
    // 2️⃣ DASHBOARD CHECKER (Supervisor as Checker)
    // ========================
    /**
     * GET /dashboard/checker
     * Shows pending/revision checksheets for validation
     */
    async getCheckerDashboard(req, res) {
        try {
            const userRole = req.user.role;

            // Role check - supervisor acts as checker
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Access denied. Supervisor role required.', 403);
            }

            const [
                // DIR counts
                dirPendingCount,
                dirRevisionCount,
                dirCheckedCount,
                dirApprovedCount,
                // FI counts
                fiPendingCount,
                fiRevisionCount,
                fiCheckedCount,
                fiApprovedCount,
                // Recent pending/revision DIRs
                pendingDirs,
                // Recent pending/revision FIs
                pendingFis,
            ] = await Promise.all([
                prisma.dir.count({ where: { status: 'pending', deletedAt: null } }),
                prisma.dir.count({ where: { status: 'revision', deletedAt: null } }),
                prisma.dir.count({ where: { status: 'checked', deletedAt: null } }),
                prisma.dir.count({ where: { status: 'approved', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'pending', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'revision', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'checked', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'approved', deletedAt: null } }),
                // Pending/revision DIRs (last 10)
                prisma.dir.findMany({
                    where: { status: { in: ['pending', 'revision'] }, deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        idDir: true,
                        status: true,
                        serialNumber: true,
                        createdAt: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                        part: { select: { partName: true } },
                        operator: { select: { fullName: true } },
                    },
                }),
                // Pending/revision FIs (last 10)
                prisma.fi.findMany({
                    where: { status: { in: ['pending', 'revision'] }, deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        idFi: true,
                        fiNumber: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                        operator: { select: { fullName: true } },
                    },
                }),
            ]);

            const response = {
                summary: {
                    totalPending: dirPendingCount + fiPendingCount,
                    totalRevision: dirRevisionCount + fiRevisionCount,
                    totalChecked: dirCheckedCount + fiCheckedCount,
                    totalApproved: dirApprovedCount + fiApprovedCount,
                },
                metrics: {
                    dir: {
                        pending: dirPendingCount,
                        revision: dirRevisionCount,
                        checked: dirCheckedCount,
                        approved: dirApprovedCount,
                    },
                    fi: {
                        pending: fiPendingCount,
                        revision: fiRevisionCount,
                        checked: fiCheckedCount,
                        approved: fiApprovedCount,
                    },
                    pendingValidation: dirPendingCount + fiPendingCount,
                    revisionReturned: dirRevisionCount + fiRevisionCount,
                },
                recentActivity: {
                    dirs: pendingDirs.map(d => ({
                        id: d.id,
                        code: d.idDir,
                        type: 'DIR',
                        status: d.status,
                        serialNumber: d.serialNumber,
                        model: d.model?.modelName,
                        part: d.part?.partName,
                        inspector: d.operator?.fullName,
                        createdAt: d.createdAt,
                        updatedAt: d.updatedAt,
                    })),
                    fis: pendingFis.map(f => ({
                        id: f.id,
                        code: f.idFi,
                        type: 'FI',
                        fiNumber: f.fiNumber,
                        status: f.status,
                        model: f.model?.modelName,
                        inspector: f.operator?.fullName,
                        createdAt: f.createdAt,
                        updatedAt: f.updatedAt,
                    })),
                },
            };

            return ResponseHelper.success(res, response, 'Checker dashboard retrieved successfully');
        } catch (error) {
            console.error('Error fetching checker dashboard:', error);
            return ResponseHelper.error(res, 'Failed to fetch checker dashboard', 500);
        }
    }

    // ========================
    // 3️⃣ DASHBOARD APPROVER (Supervisor as Approver)
    // ========================
    /**
     * GET /dashboard/approver
     * Shows checked checksheets pending approval + quality metrics
     */
    async getApproverDashboard(req, res) {
        try {
            const userRole = req.user.role;

            // Role check - supervisor acts as approver
            if (userRole !== 'supervisor') {
                return ResponseHelper.error(res, 'Access denied. Supervisor role required.', 403);
            }

            const [
                // Total counts
                totalDir,
                totalFi,
                // Status counts
                dirCheckedCount,
                dirApprovedCount,
                fiCheckedCount,
                fiApprovedCount,
                // Measurement stats (NG rate)
                totalMeasurements,
                ngMeasurements,
                // Visual inspection stats (after-repair rate)
                totalVisualInspections,
                afterRepairInspections,
                // Top NG items from measurements
                ngByDimensional,
                // Recent checked/approved DIRs
                recentDirs,
                // Recent checked/approved FIs
                recentFis,
            ] = await Promise.all([
                prisma.dir.count({ where: { deletedAt: null } }),
                prisma.fi.count({ where: { deletedAt: null } }),
                prisma.dir.count({ where: { status: 'checked', deletedAt: null } }),
                prisma.dir.count({ where: { status: 'approved', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'checked', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'approved', deletedAt: null } }),
                prisma.measurement.count({ where: { deletedAt: null } }),
                prisma.measurement.count({ where: { status: 'ng', deletedAt: null } }),
                prisma.visualInspection.count({ where: { deletedAt: null } }),
                prisma.visualInspection.count({ where: { status: 'after_repair', deletedAt: null } }),
                // Group NG by dimensional
                prisma.measurement.groupBy({
                    by: ['dimensional'],
                    where: { status: 'ng', deletedAt: null },
                    _count: { id: true },
                    orderBy: { _count: { id: 'desc' } },
                    take: 5,
                }),
                // Recent DIRs
                prisma.dir.findMany({
                    where: { status: { in: ['checked', 'approved'] }, deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        idDir: true,
                        status: true,
                        serialNumber: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                        part: { select: { partName: true } },
                    },
                }),
                // Recent FIs
                prisma.fi.findMany({
                    where: { status: { in: ['checked', 'approved'] }, deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        idFi: true,
                        fiNumber: true,
                        status: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                    },
                }),
            ]);

            // Calculate rates
            const ngRate = totalMeasurements > 0
                ? ((ngMeasurements / totalMeasurements) * 100).toFixed(2)
                : 0;
            const afterRepairRate = totalVisualInspections > 0
                ? ((afterRepairInspections / totalVisualInspections) * 100).toFixed(2)
                : 0;

            const response = {
                summary: {
                    totalChecksheets: totalDir + totalFi,
                    totalDir,
                    totalFi,
                    pendingApproval: dirCheckedCount + fiCheckedCount,
                    approved: dirApprovedCount + fiApprovedCount,
                },
                metrics: {
                    ngRate: parseFloat(ngRate),
                    ngCount: ngMeasurements,
                    totalMeasurements,
                    afterRepairRate: parseFloat(afterRepairRate),
                    afterRepairCount: afterRepairInspections,
                    totalVisualInspections,
                    topNgItems: ngByDimensional.map(item => ({
                        dimensional: item.dimensional,
                        count: item._count.id,
                    })),
                },
                recentActivity: {
                    dirs: recentDirs.map(d => ({
                        id: d.id,
                        code: d.idDir,
                        type: 'DIR',
                        status: d.status,
                        serialNumber: d.serialNumber,
                        model: d.model?.modelName,
                        part: d.part?.partName,
                        updatedAt: d.updatedAt,
                    })),
                    fis: recentFis.map(f => ({
                        id: f.id,
                        code: f.idFi,
                        type: 'FI',
                        fiNumber: f.fiNumber,
                        status: f.status,
                        model: f.model?.modelName,
                        updatedAt: f.updatedAt,
                    })),
                },
            };

            return ResponseHelper.success(res, response, 'Approver dashboard retrieved successfully');
        } catch (error) {
            console.error('Error fetching approver dashboard:', error);
            return ResponseHelper.error(res, 'Failed to fetch approver dashboard', 500);
        }
    }

    // ========================
    // 4️⃣ DASHBOARD OPERATOR (SUPER ADMIN)
    // ========================
    /**
     * GET /dashboard/operator
     * Full system overview with quality metrics and configuration status
     */
    async getOperatorDashboard(req, res) {
        try {
            const userRole = req.user.role;

            // Role check
            if (userRole !== 'operator') {
                return ResponseHelper.error(res, 'Access denied. Operator role required.', 403);
            }

            const [
                // Total counts
                totalDir,
                totalFi,
                dirPending,
                fiPending,
                // Measurement stats
                totalMeasurements,
                ngMeasurements,
                // Visual inspection stats
                totalVisualInspections,
                afterRepairInspections,
                // NG grouped by DIR model
                ngByModel,
                // Top NG items
                topNgItems,
                // System config status
                templateCount,
                drawingCount,
                modelCount,
                partCount,
                userCount,
                customerCount,
                // Recent admin activity (approvals)
                recentApprovals,
                // Recent revisions
                recentRevisions,
                // DIRs with most NG measurements
                dirsWithNg,
            ] = await Promise.all([
                prisma.dir.count({ where: { deletedAt: null } }),
                prisma.fi.count({ where: { deletedAt: null } }),
                prisma.dir.count({ where: { status: 'pending', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'pending', deletedAt: null } }),
                prisma.measurement.count({ where: { deletedAt: null } }),
                prisma.measurement.count({ where: { status: 'ng', deletedAt: null } }),
                prisma.visualInspection.count({ where: { deletedAt: null } }),
                prisma.visualInspection.count({ where: { status: 'after_repair', deletedAt: null } }),
                // NG by model
                prisma.$queryRaw`
                    SELECT m.model_name, COUNT(ms.id) as ng_count
                    FROM measurements ms
                    JOIN dirs d ON ms.dir_id = d.id
                    JOIN models m ON d.model_id = m.id
                    WHERE ms.status = 'ng' AND ms.deleted_at IS NULL
                    GROUP BY m.id, m.model_name
                    ORDER BY ng_count DESC
                    LIMIT 5
                `,
                // Top NG items by dimensional
                prisma.measurement.groupBy({
                    by: ['dimensional'],
                    where: { status: 'ng', deletedAt: null },
                    _count: { id: true },
                    orderBy: { _count: { id: 'desc' } },
                    take: 5,
                }),
                // System config
                prisma.checksheetTemplate.count({ where: { deletedAt: null } }),
                prisma.drawing.count({ where: { deletedAt: null } }),
                prisma.model.count({ where: { deletedAt: null } }),
                prisma.part.count({ where: { deletedAt: null } }),
                prisma.user.count({ where: { deletedAt: null } }),
                prisma.customer.count({ where: { deletedAt: null } }),
                // Recent approvals
                prisma.checksheetApproval.findMany({
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        referenceType: true,
                        referenceId: true,
                        note: true,
                        approvedAt: true,
                        approvedByUser: { select: { fullName: true } },
                    },
                }),
                // Recent revisions
                prisma.checksheetRevision.findMany({
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        referenceType: true,
                        referenceId: true,
                        revisionNote: true,
                        createdAt: true,
                        revisedByUser: { select: { fullName: true } },
                    },
                }),
                // DIRs with NG
                prisma.dir.findMany({
                    where: {
                        deletedAt: null,
                        measurements: { some: { status: 'ng', deletedAt: null } },
                    },
                    take: 5,
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        idDir: true,
                        status: true,
                        model: { select: { modelName: true } },
                        _count: { select: { measurements: { where: { status: 'ng' } } } },
                    },
                }),
            ]);

            // Calculate rates and risk indicator
            const overallNgRate = totalMeasurements > 0
                ? ((ngMeasurements / totalMeasurements) * 100)
                : 0;
            const afterRepairRate = totalVisualInspections > 0
                ? ((afterRepairInspections / totalVisualInspections) * 100)
                : 0;

            // Quality risk indicator
            let qualityRisk = 'LOW';
            if (overallNgRate > 10) qualityRisk = 'HIGH';
            else if (overallNgRate > 5) qualityRisk = 'MEDIUM';

            // Need attention list (DIRs with NG)
            const needAttentionList = dirsWithNg.map(d => ({
                model: d.model?.modelName,
                dirCode: d.idDir,
                issueSummary: `${d._count.measurements} NG measurements`,
                severity: d._count.measurements > 3 ? 'HIGH' : d._count.measurements > 1 ? 'MEDIUM' : 'LOW',
            }));

            const response = {
                summary: {
                    totalChecksheets: totalDir + totalFi,
                    totalDir,
                    totalFi,
                    pendingValidation: dirPending + fiPending,
                },
                metrics: {
                    overallNgRate: parseFloat(overallNgRate.toFixed(2)),
                    qualityRiskIndicator: qualityRisk,
                    dirOverview: {
                        totalMeasurements,
                        ngCount: ngMeasurements,
                        topNgItems: topNgItems.map(item => ({
                            dimensional: item.dimensional,
                            count: item._count.id,
                        })),
                        ngByModel: ngByModel.map(item => ({
                            model: item.model_name,
                            ngCount: Number(item.ng_count),
                        })),
                    },
                    fiOverview: {
                        totalVisualInspections,
                        afterRepairCount: afterRepairInspections,
                        afterRepairRate: parseFloat(afterRepairRate.toFixed(2)),
                    },
                },
                needAttention: needAttentionList,
                systemConfiguration: {
                    templatesConfigured: templateCount,
                    drawingsUploaded: drawingCount,
                    masterData: {
                        models: modelCount,
                        parts: partCount,
                        users: userCount,
                        customers: customerCount,
                    },
                    completeness: {
                        hasTemplates: templateCount > 0,
                        hasDrawings: drawingCount > 0,
                        hasMasterData: modelCount > 0 && partCount > 0 && userCount > 0,
                    },
                },
                recentActivity: {
                    approvals: recentApprovals.map(a => ({
                        id: a.id,
                        type: a.referenceType,
                        referenceId: a.referenceId,
                        note: a.note,
                        approvedBy: a.approvedByUser?.fullName,
                        approvedAt: a.approvedAt,
                    })),
                    revisions: recentRevisions.map(r => ({
                        id: r.id,
                        type: r.referenceType,
                        referenceId: r.referenceId,
                        note: r.revisionNote,
                        revisedBy: r.revisedByUser?.fullName,
                        createdAt: r.createdAt,
                    })),
                },
            };

            return ResponseHelper.success(res, response, 'Operator dashboard retrieved successfully');
        } catch (error) {
            console.error('Error fetching operator dashboard:', error);
            return ResponseHelper.error(res, 'Failed to fetch operator dashboard', 500);
        }
    }
}

module.exports = new DashboardController();
