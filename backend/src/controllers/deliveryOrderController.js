const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const codeGenerator = require('../utils/codeGenerator');
const fileUploadHelper = require('../utils/fileUploadHelper');
const fs = require('fs');
const path = require('path');

class DeliveryOrderController {
    /**
     * Get all delivery orders with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    deliveryOrderCode: {
                        contains: search,
                        mode: 'insensitive',
                    },
                }),
            };

            const [deliveryOrders, total] = await Promise.all([
                prisma.deliveryOrder.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.deliveryOrder.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, deliveryOrders, pagination, 'Delivery orders retrieved successfully');
        } catch (error) {
            console.error('Error fetching delivery orders:', error);
            return ResponseHelper.error(res, 'Failed to fetch delivery orders');
        }
    }

    /**
     * Get delivery order by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const deliveryOrder = await prisma.deliveryOrder.findFirst({
                where: { id, deletedAt: null },
            });

            if (!deliveryOrder) {
                return ResponseHelper.notFound(res, 'Delivery order not found');
            }

            return ResponseHelper.success(res, deliveryOrder, 'Delivery order retrieved successfully');
        } catch (error) {
            console.error('Error fetching delivery order:', error);
            return ResponseHelper.error(res, 'Failed to fetch delivery order');
        }
    }

    /**
     * Create new delivery order with auto-generated code and file upload
     */
    async create(req, res) {
        let uploadedFilePath = null;

        try {
            // Validate file upload
            if (!req.file) {
                return ResponseHelper.badRequest(res, 'Attachment file is required');
            }

            // Validate image file
            const validation = fileUploadHelper.validateImageFile(req.file);
            if (!validation.isValid) {
                return ResponseHelper.badRequest(res, validation.error);
            }

            // Ensure upload directory exists
            const uploadDir = fileUploadHelper.getDeliveryOrderUploadDir();
            fileUploadHelper.ensureDirectoryExists(uploadDir);

            // Generate safe filename
            const extension = fileUploadHelper.getExtensionFromMimeType(req.file.mimetype);
            const safeFilename = fileUploadHelper.generateSafeFilename(req.file.originalname, extension);
            uploadedFilePath = path.join(uploadDir, safeFilename);

            // Save file to disk
            fs.writeFileSync(uploadedFilePath, req.file.buffer);

            // Generate unique delivery order code (auto)
            const deliveryOrderCode = codeGenerator.generateDeliveryOrderCode();

            // Get public file URL
            const fileUrl = fileUploadHelper.getDeliveryOrderFileUrl(safeFilename);

            // Create delivery order in database
            const deliveryOrder = await prisma.deliveryOrder.create({
                data: {
                    deliveryOrderCode,
                    attachment: fileUrl, // Store public URL
                },
            });

            return ResponseHelper.created(
                res,
                deliveryOrder,
                'Delivery order created successfully with auto-generated code'
            );
        } catch (error) {
            // Clean up uploaded file if database operation fails
            if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                fs.unlinkSync(uploadedFilePath);
            }

            console.error('Error creating delivery order:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Delivery order code already exists');
            }
            return ResponseHelper.error(res, 'Failed to create delivery order');
        }
    }

    /**
     * Update delivery order (attachment/file only)
     */
    async update(req, res) {
        let uploadedFilePath = null;

        try {
            const { id } = req.params;

            const existingOrder = await prisma.deliveryOrder.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingOrder) {
                return ResponseHelper.notFound(res, 'Delivery order not found');
            }

            let updateData = {};

            // If file is provided, handle file upload
            if (req.file) {
                // Validate image file
                const validation = fileUploadHelper.validateImageFile(req.file);
                if (!validation.isValid) {
                    return ResponseHelper.badRequest(res, validation.error);
                }

                // Delete old file if exists
                if (existingOrder.attachment) {
                    const oldFilePath = path.join(process.cwd(), existingOrder.attachment);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }

                // Ensure upload directory exists
                const uploadDir = fileUploadHelper.getDeliveryOrderUploadDir();
                fileUploadHelper.ensureDirectoryExists(uploadDir);

                // Generate safe filename
                const extension = fileUploadHelper.getExtensionFromMimeType(req.file.mimetype);
                const safeFilename = fileUploadHelper.generateSafeFilename(req.file.originalname, extension);
                uploadedFilePath = path.join(uploadDir, safeFilename);

                // Save file to disk
                fs.writeFileSync(uploadedFilePath, req.file.buffer);

                // Get public file URL
                const fileUrl = fileUploadHelper.getDeliveryOrderFileUrl(safeFilename);
                updateData.attachment = fileUrl;
            }

            const deliveryOrder = await prisma.deliveryOrder.update({
                where: { id },
                data: updateData,
            });

            return ResponseHelper.success(res, deliveryOrder, 'Delivery order updated successfully');
        } catch (error) {
            // Clean up uploaded file if database operation fails
            if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
                fs.unlinkSync(uploadedFilePath);
            }

            console.error('Error updating delivery order:', error);
            return ResponseHelper.error(res, 'Failed to update delivery order');
        }
    }

    /**
     * Soft delete delivery order
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingOrder = await prisma.deliveryOrder.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingOrder) {
                return ResponseHelper.notFound(res, 'Delivery order not found');
            }

            // Delete attached file when deleting order
            if (existingOrder.attachment) {
                const filePath = path.join(process.cwd(), existingOrder.attachment);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            await prisma.deliveryOrder.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Delivery order deleted successfully');
        } catch (error) {
            console.error('Error deleting delivery order:', error);
            return ResponseHelper.error(res, 'Failed to delete delivery order');
        }
    }
}

module.exports = new DeliveryOrderController();
