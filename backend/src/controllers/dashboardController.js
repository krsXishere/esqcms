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
                        drawingNo: true,
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
                        drawingNo: d.drawingNo,
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
                        drawingNo: true,
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
                        drawingNo: d.drawingNo,
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
                prisma.measurement.count({ where: { status: { in: ['repair', 'reject'] }, deletedAt: null } }),
                prisma.visualInspection.count({ where: { deletedAt: null } }),
                prisma.visualInspection.count({ where: { status: 'after_repair', deletedAt: null } }),
                // Group NG (repair/reject) by dimensional
                prisma.measurement.groupBy({
                    by: ['dimensional'],
                    where: { status: { in: ['repair', 'reject'] }, deletedAt: null },
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
                        drawingNo: true,
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
                        drawingNo: d.drawingNo,
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
     * Optimized for frontend dashboard page.jsx
     */
    async getOperatorDashboard(req, res) {
        try {
            const userRole = req.user.role;

            // Role check
            if (userRole !== 'operator') {
                return ResponseHelper.error(res, 'Access denied. Operator role required.', 403);
            }

            // Date calculations for period comparisons
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            const [
                // Total counts (current)
                totalDir,
                totalFi,
                // Total counts (last month for comparison)
                lastMonthDir,
                lastMonthFi,
                // Pending counts
                dirPending,
                fiPending,
                lastMonthDirPending,
                lastMonthFiPending,
                // Revision counts
                dirRevision,
                fiRevision,
                lastMonthDirRevision,
                lastMonthFiRevision,
                // Completed today
                dirCompletedToday,
                fiCompletedToday,
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
                // Recent checksheets (combined DIR + FI for table)
                recentDirs,
                recentFis,
                // Revision queue (DIRs + FIs in revision status)
                revisionDirs,
                revisionFis,
                // DIRs with most NG (repair/reject) measurements
                dirsWithNg,
            ] = await Promise.all([
                // Current totals
                prisma.dir.count({ where: { deletedAt: null } }),
                prisma.fi.count({ where: { deletedAt: null } }),
                // Last month totals (for comparison)
                prisma.dir.count({ where: { createdAt: { lt: thisMonthStart }, deletedAt: null } }),
                prisma.fi.count({ where: { createdAt: { lt: thisMonthStart }, deletedAt: null } }),
                // Pending
                prisma.dir.count({ where: { status: 'pending', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'pending', deletedAt: null } }),
                prisma.dir.count({ where: { status: 'pending', createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null } }),
                prisma.fi.count({ where: { status: 'pending', createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null } }),
                // Revision
                prisma.dir.count({ where: { status: 'revision', deletedAt: null } }),
                prisma.fi.count({ where: { status: 'revision', deletedAt: null } }),
                prisma.dir.count({ where: { status: 'revision', createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null } }),
                prisma.fi.count({ where: { status: 'revision', createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, deletedAt: null } }),
                // Completed today (approved today)
                prisma.dir.count({ where: { status: 'approved', updatedAt: { gte: todayStart, lt: todayEnd }, deletedAt: null } }),
                prisma.fi.count({ where: { status: 'approved', updatedAt: { gte: todayStart, lt: todayEnd }, deletedAt: null } }),
                // Measurements
                prisma.measurement.count({ where: { deletedAt: null } }),
                prisma.measurement.count({ where: { status: { in: ['repair', 'reject'] }, deletedAt: null } }),
                // Visual inspections
                prisma.visualInspection.count({ where: { deletedAt: null } }),
                prisma.visualInspection.count({ where: { status: 'after_repair', deletedAt: null } }),
                // NG by model
                prisma.$queryRaw`
                    SELECT m.model_name, COUNT(ms.id) as ng_count
                    FROM measurements ms
                    JOIN dirs d ON ms.dir_id = d.id
                    JOIN models m ON d.model_id = m.id
                    WHERE ms.status IN ('repair', 'reject') AND ms.deleted_at IS NULL
                    GROUP BY m.id, m.model_name
                    ORDER BY ng_count DESC
                    LIMIT 5
                `,
                // Top NG items by dimensional
                prisma.measurement.groupBy({
                    by: ['dimensional'],
                    where: { status: { in: ['repair', 'reject'] }, deletedAt: null },
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
                // Recent DIRs for table
                prisma.dir.findMany({
                    where: { deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        idDir: true,
                        status: true,
                        drawingNo: true,
                        createdAt: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                        part: { select: { partName: true } },
                        operator: { select: { fullName: true } },
                    },
                }),
                // Recent FIs for table
                prisma.fi.findMany({
                    where: { deletedAt: null },
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
                        operator: { select: { fullName: true } },
                    },
                }),
                // Revision queue - DIRs
                prisma.dir.findMany({
                    where: { status: 'revision', deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 6,
                    select: {
                        id: true,
                        idDir: true,
                        status: true,
                        drawingNo: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                        operator: { select: { fullName: true } },
                    },
                }),
                // Revision queue - FIs
                prisma.fi.findMany({
                    where: { status: 'revision', deletedAt: null },
                    orderBy: { updatedAt: 'desc' },
                    take: 6,
                    select: {
                        id: true,
                        idFi: true,
                        fiNumber: true,
                        status: true,
                        updatedAt: true,
                        model: { select: { modelName: true } },
                        operator: { select: { fullName: true } },
                    },
                }),
                // DIRs with NG (repair/reject)
                prisma.dir.findMany({
                    where: {
                        deletedAt: null,
                        measurements: { some: { status: { in: ['repair', 'reject'] }, deletedAt: null } },
                    },
                    take: 5,
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        idDir: true,
                        status: true,
                        model: { select: { modelName: true } },
                        _count: { select: { measurements: { where: { status: { in: ['repair', 'reject'] } } } } },
                    },
                }),
            ]);

            // Fetch revision data for DIR and FI items
            const dirIds = revisionDirs.map(d => d.id);
            const fiIds = revisionFis.map(f => f.id);

            const [dirRevisions, fiRevisions] = await Promise.all([
                dirIds.length > 0 ? prisma.checksheetRevision.findMany({
                    where: {
                        referenceType: 'DIR',
                        referenceId: { in: dirIds },
                        deletedAt: null,
                    },
                    orderBy: { createdAt: 'desc' },
                    select: {
                        referenceId: true,
                        revisionNote: true,
                        createdAt: true,
                        revisedByUser: { select: { fullName: true } },
                    },
                }) : [],
                fiIds.length > 0 ? prisma.checksheetRevision.findMany({
                    where: {
                        referenceType: 'FI',
                        referenceId: { in: fiIds },
                        deletedAt: null,
                    },
                    orderBy: { createdAt: 'desc' },
                    select: {
                        referenceId: true,
                        revisionNote: true,
                        createdAt: true,
                        revisedByUser: { select: { fullName: true } },
                    },
                }) : [],
            ]);

            // Create revision lookup maps
            const dirRevisionMap = {};
            dirRevisions.forEach(r => {
                if (!dirRevisionMap[r.referenceId]) {
                    dirRevisionMap[r.referenceId] = r;
                }
            });
            const fiRevisionMap = {};
            fiRevisions.forEach(r => {
                if (!fiRevisionMap[r.referenceId]) {
                    fiRevisionMap[r.referenceId] = r;
                }
            });

            // Calculate rates and changes
            const currentTotal = totalDir + totalFi;
            const lastMonthTotal = lastMonthDir + lastMonthFi;
            const thisMonthNew = currentTotal - lastMonthTotal;
            const totalChange = lastMonthTotal > 0
                ? Math.round(((thisMonthNew) / lastMonthTotal) * 100)
                : (thisMonthNew > 0 ? 100 : 0);

            const currentPending = dirPending + fiPending;
            const lastMonthPending = lastMonthDirPending + lastMonthFiPending;
            const pendingChange = lastMonthPending > 0
                ? Math.round(((currentPending - lastMonthPending) / lastMonthPending) * 100)
                : (currentPending > 0 ? 100 : 0);

            const currentRevision = dirRevision + fiRevision;
            const lastMonthRevisionTotal = lastMonthDirRevision + lastMonthFiRevision;
            const revisionChange = lastMonthRevisionTotal > 0
                ? (currentRevision - lastMonthRevisionTotal)
                : currentRevision;

            const completedToday = dirCompletedToday + fiCompletedToday;

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

            // Pass rate = (total - ng) / total * 100
            const passRate = totalMeasurements > 0
                ? Math.round(((totalMeasurements - ngMeasurements) / totalMeasurements) * 100)
                : 100;

            // Revision rate
            const revisionRate = currentTotal > 0
                ? Math.round((currentRevision / currentTotal) * 100)
                : 0;

            // Format today's date
            const todayFormatted = now.toISOString().split('T')[0];

            // Build KPI cards data (matching frontend mockKPIs structure)
            const kpiCards = [
                {
                    title: 'Total Checksheets',
                    value: currentTotal,
                    change: `${totalChange >= 0 ? '+' : ''}${totalChange}%`,
                    trend: totalChange >= 0 ? 'up' : 'down',
                    subtitle: 'This month',
                },
                {
                    title: 'Pending Approval',
                    value: currentPending,
                    change: `${pendingChange >= 0 ? '+' : ''}${pendingChange}%`,
                    trend: pendingChange <= 0 ? 'down' : 'up', // Less pending is better
                    subtitle: 'Awaiting review',
                },
                {
                    title: 'Revision Needed',
                    value: currentRevision,
                    change: `${revisionChange >= 0 ? '+' : ''}${revisionChange}`,
                    trend: revisionChange <= 0 ? 'down' : 'up',
                    subtitle: 'Requires attention',
                },
                {
                    title: 'Completed Today',
                    value: completedToday,
                    change: '+0%', // Would need historical data
                    trend: 'up',
                    subtitle: todayFormatted,
                },
            ];

            // Build recent checksheets (combining DIRs and FIs, sorted by date)
            const recentChecksheets = [
                ...recentDirs.map(d => ({
                    id: d.id,
                    no: d.idDir,
                    type: 'In Process', // DIR is dimensional inspection = In Process
                    model: d.model?.modelName || '-',
                    inspector: d.operator?.fullName || '-',
                    status: d.status,
                    date: d.updatedAt?.toISOString().split('T')[0] || '-',
                })),
                ...recentFis.map(f => ({
                    id: f.id,
                    no: f.idFi,
                    type: 'Final', // FI is Final Inspection
                    model: f.model?.modelName || '-',
                    inspector: f.operator?.fullName || '-',
                    status: f.status,
                    date: f.updatedAt?.toISOString().split('T')[0] || '-',
                })),
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

            // Build revision queue (matching frontend mockRevisionQueue structure)
            const revisionQueue = [
                ...revisionDirs.map(d => {
                    const rev = dirRevisionMap[d.id];
                    return {
                        id: d.id,
                        no: d.idDir,
                        type: 'DIR',
                        model: d.model?.modelName || '-',
                        inspector: d.operator?.fullName || '-',
                        reason: rev?.revisionNote || 'Revision required',
                        requestedBy: rev?.revisedByUser?.fullName || '-',
                        date: rev?.createdAt?.toISOString().split('T')[0] || d.updatedAt?.toISOString().split('T')[0] || '-',
                        priority: 'medium', // Default priority
                    };
                }),
                ...revisionFis.map(f => {
                    const rev = fiRevisionMap[f.id];
                    return {
                        id: f.id,
                        no: f.idFi,
                        type: 'FI',
                        model: f.model?.modelName || '-',
                        inspector: f.operator?.fullName || '-',
                        reason: rev?.revisionNote || 'Revision required',
                        requestedBy: rev?.revisedByUser?.fullName || '-',
                        date: rev?.createdAt?.toISOString().split('T')[0] || f.updatedAt?.toISOString().split('T')[0] || '-',
                        priority: 'medium', // Default priority
                    };
                }),
            ].sort((a, b) => {
                // Sort by priority first (high > medium > low), then by date
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                return new Date(b.date) - new Date(a.date);
            }).slice(0, 6);

            // Quick stats (matching frontend quickStats structure)
            const quickStats = [
                { label: 'Pass Rate', value: passRate, color: '#10B981' },
                { label: 'On-Time Completion', value: 87, color: '#2F80ED' }, // Would need SLA tracking
                { label: 'Revision Rate', value: revisionRate, color: '#F59E0B' },
            ];

            // Need attention list (DIRs with NG)
            const needAttentionList = dirsWithNg.map(d => ({
                model: d.model?.modelName,
                dirCode: d.idDir,
                issueSummary: `${d._count.measurements} NG measurements`,
                severity: d._count.measurements > 3 ? 'HIGH' : d._count.measurements > 1 ? 'MEDIUM' : 'LOW',
            }));

            const response = {
                // New structure matching frontend page.jsx
                kpiCards,
                recentChecksheets,
                revisionQueue,
                quickStats,
                // Original structure (kept for backward compatibility)
                summary: {
                    totalChecksheets: currentTotal,
                    totalDir,
                    totalFi,
                    pendingValidation: currentPending,
                    revisionNeeded: currentRevision,
                    completedToday,
                },
                metrics: {
                    overallNgRate: parseFloat(overallNgRate.toFixed(2)),
                    qualityRiskIndicator: qualityRisk,
                    passRate,
                    revisionRate,
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
