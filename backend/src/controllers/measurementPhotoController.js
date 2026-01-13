const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class MeasurementPhotoController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, measurementId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(measurementId && { measurementId }),
            };

            const [photos, total] = await Promise.all([
                prisma.measurementPhoto.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        measurement: {
                            select: { id: true, dimensional: true, actual: true, status: true },
                        },
                        rejectReason: true,
                    },
                }),
                prisma.measurementPhoto.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, photos, pagination, 'Measurement photos retrieved successfully');
        } catch (error) {
            console.error('Error fetching measurement photos:', error);
            return ResponseHelper.error(res, 'Failed to fetch measurement photos');
        }
    }

    async getByMeasurementId(req, res) {
        try {
            const { measurementId } = req.params;

            const photos = await prisma.measurementPhoto.findMany({
                where: { measurementId, deletedAt: null },
                orderBy: { createdAt: 'desc' },
                include: {
                    rejectReason: true,
                },
            });

            return ResponseHelper.success(res, photos, 'Measurement photos retrieved successfully');
        } catch (error) {
            console.error('Error fetching measurement photos:', error);
            return ResponseHelper.error(res, 'Failed to fetch measurement photos');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const photo = await prisma.measurementPhoto.findFirst({
                where: { id, deletedAt: null },
                include: {
                    measurement: true,
                    rejectReason: true,
                },
            });

            if (!photo) {
                return ResponseHelper.notFound(res, 'Measurement photo not found');
            }

            return ResponseHelper.success(res, photo, 'Measurement photo retrieved successfully');
        } catch (error) {
            console.error('Error fetching measurement photo:', error);
            return ResponseHelper.error(res, 'Failed to fetch measurement photo');
        }
    }

    async create(req, res) {
        try {
            const { measurementId, rejectReasonId, photoPath, remark } = req.body;

            if (!measurementId || !rejectReasonId || !photoPath) {
                return ResponseHelper.badRequest(res, 'Measurement ID, reject reason ID and photo path are required');
            }

            const photo = await prisma.measurementPhoto.create({
                data: { measurementId, rejectReasonId, photoPath, remark },
                include: {
                    measurement: {
                        select: { id: true, dimensional: true, actual: true, status: true },
                    },
                    rejectReason: true,
                },
            });

            return ResponseHelper.created(res, photo, 'Measurement photo created successfully');
        } catch (error) {
            console.error('Error creating measurement photo:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid measurement or reject reason reference');
            }
            return ResponseHelper.error(res, 'Failed to create measurement photo');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { rejectReasonId, photoPath, remark } = req.body;

            const existingPhoto = await prisma.measurementPhoto.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingPhoto) {
                return ResponseHelper.notFound(res, 'Measurement photo not found');
            }

            const photo = await prisma.measurementPhoto.update({
                where: { id },
                data: {
                    ...(rejectReasonId && { rejectReasonId }),
                    ...(photoPath && { photoPath }),
                    ...(remark !== undefined && { remark }),
                },
                include: {
                    rejectReason: true,
                },
            });

            return ResponseHelper.success(res, photo, 'Measurement photo updated successfully');
        } catch (error) {
            console.error('Error updating measurement photo:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid reject reason reference');
            }
            return ResponseHelper.error(res, 'Failed to update measurement photo');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingPhoto = await prisma.measurementPhoto.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingPhoto) {
                return ResponseHelper.notFound(res, 'Measurement photo not found');
            }

            await prisma.measurementPhoto.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Measurement photo deleted successfully');
        } catch (error) {
            console.error('Error deleting measurement photo:', error);
            return ResponseHelper.error(res, 'Failed to delete measurement photo');
        }
    }
}

module.exports = new MeasurementPhotoController();
