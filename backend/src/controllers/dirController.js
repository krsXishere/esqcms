const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class DirController {
    /**
     * Get all dirs with pagination and relations
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', status = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { idDir: { contains: search, mode: 'insensitive' } },
                        { serialNumber: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(status && { status }),
            };

            const [dirs, total] = await Promise.all([
                prisma.dir.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        model: true,
                        part: true,
                        operator: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                role: true,
                            },
                        },
                        customer: true,
                        deliveryOrder: true,
                        material: true,
                        shift: true,
                        section: true,
                        checksheetTemplate: true,
                    },
                }),
                prisma.dir.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, dirs, pagination, 'DIRs retrieved successfully');
        } catch (error) {
            console.error('Error fetching dirs:', error);
            return ResponseHelper.error(res, 'Failed to fetch DIRs');
        }
    }

    /**
     * Get dir by ID with relations
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const dir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
                include: {
                    model: true,
                    part: true,
                    operator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    customer: true,
                    deliveryOrder: true,
                    material: true,
                    shift: true,
                    section: true,
                    checksheetTemplate: true,
                    measurements: {
                        where: { deletedAt: null },
                    },
                },
            });

            if (!dir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            return ResponseHelper.success(res, dir, 'DIR retrieved successfully');
        } catch (error) {
            console.error('Error fetching dir:', error);
            return ResponseHelper.error(res, 'Failed to fetch DIR');
        }
    }

    /**
     * Create new dir
     */
    async create(req, res) {
        try {
            const {
                idDir,
                modelId,
                partId,
                operatorId,
                customerId,
                deliveryOrderId,
                materialId,
                shiftId,
                sectionId,
                checksheetTemplateId,
                serialNumber,
                recommendation,
                generalNote,
                status = 'pending',
            } = req.body;

            // Validate required fields
            if (!idDir || !modelId || !partId || !operatorId || !customerId || !deliveryOrderId || !materialId || !shiftId || !sectionId || !serialNumber) {
                return ResponseHelper.badRequest(res, 'All required fields must be provided');
            }

            // Validate status
            const validStatuses = ['pending', 'revision', 'approved'];
            if (!validStatuses.includes(status)) {
                return ResponseHelper.badRequest(res, 'Invalid status. Must be pending, revision, or approved');
            }

            // Check if serial number already exists
            const existingDir = await prisma.dir.findUnique({
                where: { serialNumber },
            });

            if (existingDir) {
                return ResponseHelper.badRequest(res, 'Serial number already exists');
            }

            const dir = await prisma.dir.create({
                data: {
                    idDir,
                    modelId,
                    partId,
                    operatorId,
                    customerId,
                    deliveryOrderId,
                    materialId,
                    shiftId,
                    sectionId,
                    checksheetTemplateId,
                    serialNumber,
                    recommendation,
                    generalNote,
                    status,
                },
                include: {
                    model: true,
                    part: true,
                    operator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    customer: true,
                    deliveryOrder: true,
                    material: true,
                    shift: true,
                    section: true,
                    checksheetTemplate: true,
                },
            });

            return ResponseHelper.created(res, dir, 'DIR created successfully');
        } catch (error) {
            console.error('Error creating dir:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Serial number already exists');
            }
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid foreign key reference');
            }
            return ResponseHelper.error(res, 'Failed to create DIR');
        }
    }

    /**
     * Update dir
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                idDir,
                modelId,
                partId,
                operatorId,
                customerId,
                deliveryOrderId,
                materialId,
                shiftId,
                sectionId,
                checksheetTemplateId,
                serialNumber,
                recommendation,
                generalNote,
                status,
            } = req.body;

            const existingDir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingDir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            // Validate status if provided
            if (status) {
                const validStatuses = ['pending', 'revision', 'approved'];
                if (!validStatuses.includes(status)) {
                    return ResponseHelper.badRequest(res, 'Invalid status. Must be pending, revision, or approved');
                }
            }

            // Check if new serial number conflicts
            if (serialNumber && serialNumber !== existingDir.serialNumber) {
                const conflictDir = await prisma.dir.findUnique({
                    where: { serialNumber },
                });
                if (conflictDir && conflictDir.id !== id) {
                    return ResponseHelper.badRequest(res, 'Serial number already exists');
                }
            }

            const dir = await prisma.dir.update({
                where: { id },
                data: {
                    ...(idDir && { idDir }),
                    ...(modelId && { modelId }),
                    ...(partId && { partId }),
                    ...(operatorId && { operatorId }),
                    ...(customerId && { customerId }),
                    ...(deliveryOrderId && { deliveryOrderId }),
                    ...(materialId && { materialId }),
                    ...(shiftId && { shiftId }),
                    ...(sectionId && { sectionId }),
                    ...(checksheetTemplateId !== undefined && { checksheetTemplateId }),
                    ...(serialNumber && { serialNumber }),
                    ...(recommendation !== undefined && { recommendation }),
                    ...(generalNote !== undefined && { generalNote }),
                    ...(status && { status }),
                },
                include: {
                    model: true,
                    part: true,
                    operator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    customer: true,
                    deliveryOrder: true,
                    material: true,
                    shift: true,
                    section: true,
                    checksheetTemplate: true,
                },
            });

            return ResponseHelper.success(res, dir, 'DIR updated successfully');
        } catch (error) {
            console.error('Error updating dir:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Serial number already exists');
            }
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid foreign key reference');
            }
            return ResponseHelper.error(res, 'Failed to update DIR');
        }
    }

    /**
     * Soft delete dir
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingDir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingDir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            await prisma.dir.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'DIR deleted successfully');
        } catch (error) {
            console.error('Error deleting dir:', error);
            return ResponseHelper.error(res, 'Failed to delete DIR');
        }
    }

    /**
     * Update dir status
     */
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'revision', 'approved'];
            if (!validStatuses.includes(status)) {
                return ResponseHelper.badRequest(res, 'Invalid status. Must be pending, revision, or approved');
            }

            const existingDir = await prisma.dir.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingDir) {
                return ResponseHelper.notFound(res, 'DIR not found');
            }

            const dir = await prisma.dir.update({
                where: { id },
                data: { status },
            });

            return ResponseHelper.success(res, dir, 'DIR status updated successfully');
        } catch (error) {
            console.error('Error updating dir status:', error);
            return ResponseHelper.error(res, 'Failed to update DIR status');
        }
    }
}

module.exports = new DirController();
