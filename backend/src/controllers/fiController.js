const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const codeGenerator = require('../utils/codeGenerator');

class FiController {
    /**
     * Get all FIs with pagination and relations
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', status = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { idFi: { contains: search, mode: 'insensitive' } },
                        { fiNumber: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(status && { status }),
            };

            const [fis, total] = await Promise.all([
                prisma.fi.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        model: true,
                        operator: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                                role: true,
                            },
                        },
                        customer: true,
                        shift: true,
                        section: true,
                        checksheetTemplate: true,
                    },
                }),
                prisma.fi.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, fis, pagination, 'FIs retrieved successfully');
        } catch (error) {
            console.error('Error fetching FIs:', error);
            return ResponseHelper.error(res, 'Failed to fetch FIs');
        }
    }

    /**
     * Get FI by ID with relations
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const fi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
                include: {
                    model: true,
                    operator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    customer: true,
                    shift: true,
                    section: true,
                    checksheetTemplate: true,
                    visualInspections: {
                        where: { deletedAt: null },
                    },
                },
            });

            if (!fi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            return ResponseHelper.success(res, fi, 'FI retrieved successfully');
        } catch (error) {
            console.error('Error fetching FI:', error);
            return ResponseHelper.error(res, 'Failed to fetch FI');
        }
    }

    /**
     * Create new FI
     */
    async create(req, res) {
        try {
            const {
                fiNumber,
                modelId,
                operatorId,
                customerId,
                shiftId,
                sectionId,
                checksheetTemplateId,
                customerSpecification,
                impellerDiameter,
                numericField,
                generalNote,
                status = 'pending',
            } = req.body;

            // Validate required fields
            if (!fiNumber || !modelId || !operatorId || !customerId || !shiftId || !sectionId ||
                !customerSpecification || impellerDiameter === undefined || numericField === undefined) {
                return ResponseHelper.badRequest(res, 'All required fields must be provided');
            }

            // Validate status
            const validStatuses = ['pending', 'revision', 'approved'];
            if (!validStatuses.includes(status)) {
                return ResponseHelper.badRequest(res, 'Invalid status. Must be pending, revision, or approved');
            }

            // Auto-generate idFi
            const idFi = codeGenerator.generateFiCode();

            const fi = await prisma.fi.create({
                data: {
                    idFi,
                    fiNumber,
                    modelId,
                    operatorId,
                    customerId,
                    shiftId,
                    sectionId,
                    checksheetTemplateId,
                    customerSpecification,
                    impellerDiameter: parseFloat(impellerDiameter),
                    numericField: parseFloat(numericField),
                    generalNote,
                    status,
                },
                include: {
                    model: true,
                    operator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    customer: true,
                    shift: true,
                    section: true,
                    checksheetTemplate: true,
                },
            });

            return ResponseHelper.created(res, fi, 'FI created successfully');
        } catch (error) {
            console.error('Error creating FI:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid foreign key reference');
            }
            return ResponseHelper.error(res, 'Failed to create FI');
        }
    }

    /**
     * Update FI
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                idFi,
                fiNumber,
                modelId,
                operatorId,
                customerId,
                shiftId,
                sectionId,
                checksheetTemplateId,
                customerSpecification,
                impellerDiameter,
                numericField,
                generalNote,
                status,
            } = req.body;

            const existingFi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingFi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            // Validate status if provided
            if (status) {
                const validStatuses = ['pending', 'revision', 'approved'];
                if (!validStatuses.includes(status)) {
                    return ResponseHelper.badRequest(res, 'Invalid status. Must be pending, revision, or approved');
                }
            }

            const fi = await prisma.fi.update({
                where: { id },
                data: {
                    ...(idFi && { idFi }),
                    ...(fiNumber && { fiNumber }),
                    ...(modelId && { modelId }),
                    ...(operatorId && { operatorId }),
                    ...(customerId && { customerId }),
                    ...(shiftId && { shiftId }),
                    ...(sectionId && { sectionId }),
                    ...(checksheetTemplateId !== undefined && { checksheetTemplateId }),
                    ...(customerSpecification && { customerSpecification }),
                    ...(impellerDiameter !== undefined && { impellerDiameter: parseFloat(impellerDiameter) }),
                    ...(numericField !== undefined && { numericField: parseFloat(numericField) }),
                    ...(generalNote !== undefined && { generalNote }),
                    ...(status && { status }),
                },
                include: {
                    model: true,
                    operator: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                    customer: true,
                    shift: true,
                    section: true,
                    checksheetTemplate: true,
                },
            });

            return ResponseHelper.success(res, fi, 'FI updated successfully');
        } catch (error) {
            console.error('Error updating FI:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid foreign key reference');
            }
            return ResponseHelper.error(res, 'Failed to update FI');
        }
    }

    /**
     * Soft delete FI
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingFi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingFi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            await prisma.fi.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'FI deleted successfully');
        } catch (error) {
            console.error('Error deleting FI:', error);
            return ResponseHelper.error(res, 'Failed to delete FI');
        }
    }

    /**
     * Update FI status
     */
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'revision', 'approved'];
            if (!validStatuses.includes(status)) {
                return ResponseHelper.badRequest(res, 'Invalid status. Must be pending, revision, or approved');
            }

            const existingFi = await prisma.fi.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingFi) {
                return ResponseHelper.notFound(res, 'FI not found');
            }

            const fi = await prisma.fi.update({
                where: { id },
                data: { status },
            });

            return ResponseHelper.success(res, fi, 'FI status updated successfully');
        } catch (error) {
            console.error('Error updating FI status:', error);
            return ResponseHelper.error(res, 'Failed to update FI status');
        }
    }
}

module.exports = new FiController();
