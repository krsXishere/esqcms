const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class ShiftController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { shiftCode: { contains: search, mode: 'insensitive' } },
                        { shiftName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };

            const [shifts, total] = await Promise.all([
                prisma.shift.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.shift.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, shifts, pagination, 'Shifts retrieved successfully');
        } catch (error) {
            console.error('Error fetching shifts:', error);
            return ResponseHelper.error(res, 'Failed to fetch shifts');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const shift = await prisma.shift.findFirst({
                where: { id, deletedAt: null },
            });

            if (!shift) {
                return ResponseHelper.notFound(res, 'Shift not found');
            }

            return ResponseHelper.success(res, shift, 'Shift retrieved successfully');
        } catch (error) {
            console.error('Error fetching shift:', error);
            return ResponseHelper.error(res, 'Failed to fetch shift');
        }
    }

    async create(req, res) {
        try {
            const { shiftCode, shiftName, startTime, endTime } = req.body;

            if (!shiftCode || !shiftName || !startTime || !endTime) {
                return ResponseHelper.badRequest(res, 'Shift code, name, start time and end time are required');
            }

            const shift = await prisma.shift.create({
                data: {
                    shiftCode,
                    shiftName,
                    startTime: new Date(`1970-01-01T${startTime}:00`),
                    endTime: new Date(`1970-01-01T${endTime}:00`),
                },
            });

            return ResponseHelper.created(res, shift, 'Shift created successfully');
        } catch (error) {
            console.error('Error creating shift:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Shift code already exists');
            }
            return ResponseHelper.error(res, 'Failed to create shift');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { shiftCode, shiftName, startTime, endTime } = req.body;

            const existingShift = await prisma.shift.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingShift) {
                return ResponseHelper.notFound(res, 'Shift not found');
            }

            const shift = await prisma.shift.update({
                where: { id },
                data: {
                    ...(shiftCode && { shiftCode }),
                    ...(shiftName && { shiftName }),
                    ...(startTime && { startTime: new Date(`1970-01-01T${startTime}:00`) }),
                    ...(endTime && { endTime: new Date(`1970-01-01T${endTime}:00`) }),
                },
            });

            return ResponseHelper.success(res, shift, 'Shift updated successfully');
        } catch (error) {
            console.error('Error updating shift:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Shift code already exists');
            }
            return ResponseHelper.error(res, 'Failed to update shift');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingShift = await prisma.shift.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingShift) {
                return ResponseHelper.notFound(res, 'Shift not found');
            }

            await prisma.shift.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Shift deleted successfully');
        } catch (error) {
            console.error('Error deleting shift:', error);
            return ResponseHelper.error(res, 'Failed to delete shift');
        }
    }
}

module.exports = new ShiftController();
