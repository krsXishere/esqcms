const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

/**
 * Checksheet Monitoring Controller
 * Combines DIRs and FIs with all necessary info for monitoring dashboard
 */
class ChecksheetMonitoringController {
    /**
     * GET /api/checksheets/monitoring
     * Lists all DIRs and FIs for monitoring page with filtering and pagination
     * 
     * Query params:
     * - page: page number (default 1)
     * - limit: items per page (default 10)
     * - search: search by checksheet id or drawing no
     * - type: filter by type (dir, fi)
     * - status: filter by status (pending, revision, checked, approved)
     * - model_id: filter by model ID
     * - part_id: filter by part ID
     * - sort_field: field to sort by (createdAt, updatedAt, status)
     * - sort_dir: sort direction (asc, desc)
     */
    async getMonitoring(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                type = '',
                status = '',
                model_id = '',
                part_id = '',
                sort_field = 'createdAt',
                sort_dir = 'desc',
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const take = parseInt(limit);

            // Build where clause for DIRs
            const dirWhere = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { idDir: { contains: search, mode: 'insensitive' } },
                        { drawingNo: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(status && { status }),
                ...(model_id && { modelId: model_id }),
                ...(part_id && { partId: part_id }),
            };

            // Build where clause for FIs (FI doesn't have drawingNo, uses fiNumber instead)
            const fiWhere = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { idFi: { contains: search, mode: 'insensitive' } },
                        { fiNumber: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(status && { status }),
                ...(model_id && { modelId: model_id }),
                // FI doesn't have partId, skip this filter for FI
            };

            // Determine sort order
            const orderBy = {};
            orderBy[sort_field] = sort_dir === 'asc' ? 'asc' : 'desc';

            // Fetch DIRs and FIs in parallel
            let [dirs, fis, dirCount, fiCount] = await Promise.all([
                type !== 'fi' ? prisma.dir.findMany({
                    where: dirWhere,
                    skip,
                    take,
                    orderBy,
                    include: {
                        model: { select: { id: true, modelName: true } },
                        part: { select: { id: true, partName: true } },
                        operator: { select: { id: true, fullName: true } },
                        checksheetTemplate: { select: { id: true } },
                    },
                }) : [],
                type !== 'dir' ? prisma.fi.findMany({
                    where: fiWhere,
                    skip,
                    take,
                    orderBy,
                    include: {
                        model: { select: { id: true, modelName: true } },
                        // FI doesn't have part relation
                        operator: { select: { id: true, fullName: true } },
                        checksheetTemplate: { select: { id: true } },
                    },
                }) : [],
                type !== 'fi' ? prisma.dir.count({ where: dirWhere }) : 0,
                type !== 'dir' ? prisma.fi.count({ where: fiWhere }) : 0,
            ]);

            // Format DIRs
            const formattedDirs = dirs.map(dir => ({
                id: dir.id,
                checksheet_id: dir.idDir,
                serial_number: dir.drawingNo,
                type: 'dir',
                model_name: dir.model?.modelName || '-',
                part_name: dir.part?.partName || '-',
                inspector_name: dir.operator?.fullName || '-',
                foreman_name: '-', // Will be populated from approvals if needed
                approver_name: '-', // Will be populated from approvals if needed
                status: dir.status,
                final_result: dir.finalResult || 'OK',
                updated_at: dir.updatedAt,
            }));

            // Format FIs (FI uses fiNumber instead of drawingNo, and doesn't have part)
            const formattedFis = fis.map(fi => ({
                id: fi.id,
                checksheet_id: fi.idFi,
                serial_number: fi.fiNumber, // FI uses fiNumber
                type: 'fi',
                model_name: fi.model?.modelName || '-',
                part_name: '-', // FI doesn't have part relation
                inspector_name: fi.operator?.fullName || '-',
                foreman_name: '-', // Will be populated from approvals if needed
                approver_name: '-', // Will be populated from approvals if needed
                status: fi.status,
                final_result: fi.finalResult || 'OK',
                updated_at: fi.updatedAt,
            }));

            // Combine and sort if needed
            let allRows = [...formattedDirs, ...formattedFis];

            // If no specific type filter, apply pagination to combined result
            if (!type) {
                // Get total count for both DIR and FI
                const totalDir = dirCount;
                const totalFi = fiCount;
                const totalAll = totalDir + totalFi;

                // Apply sorting and pagination to combined results
                const sortFieldKey = sort_field === 'createdAt' ? 'updated_at' : sort_field;
                allRows.sort((a, b) => {
                    const aVal = a[sortFieldKey];
                    const bVal = b[sortFieldKey];

                    if (aVal < bVal) return sort_dir === 'asc' ? -1 : 1;
                    if (aVal > bVal) return sort_dir === 'asc' ? 1 : -1;
                    return 0;
                });

                allRows = allRows.slice(skip, skip + take);

                const pagination = {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalAll,
                    total_pages: Math.ceil(totalAll / parseInt(limit)),
                };

                return ResponseHelper.paginate(res, allRows, pagination, 'Checksheets retrieved successfully');
            } else {
                // If specific type, use the count from that type
                const total = type === 'dir' ? dirCount : fiCount;
                const pagination = {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    total_pages: Math.ceil(total / parseInt(limit)),
                };

                return ResponseHelper.paginate(res, allRows, pagination, 'Checksheets retrieved successfully');
            }

        } catch (error) {
            console.error('Error fetching monitoring checksheets:', error);
            return ResponseHelper.error(res, 'Failed to fetch checksheets');
        }
    }
}

module.exports = new ChecksheetMonitoringController();
