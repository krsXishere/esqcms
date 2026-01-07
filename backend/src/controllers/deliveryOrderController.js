const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

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
     * Create new delivery order
     */
    async create(req, res) {
        try {
            const { deliveryOrderCode, attachment } = req.body;

            if (!deliveryOrderCode) {
                return ResponseHelper.badRequest(res, 'Delivery order code is required');
            }

            // Check if delivery order code already exists
            const existingOrder = await prisma.deliveryOrder.findUnique({
                where: { deliveryOrderCode },
            });

            if (existingOrder) {
                return ResponseHelper.badRequest(res, 'Delivery order code already exists');
            }

            const deliveryOrder = await prisma.deliveryOrder.create({
                data: { deliveryOrderCode, attachment },
            });

            return ResponseHelper.created(res, deliveryOrder, 'Delivery order created successfully');
        } catch (error) {
            console.error('Error creating delivery order:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Delivery order code already exists');
            }
            return ResponseHelper.error(res, 'Failed to create delivery order');
        }
    }

    /**
     * Update delivery order
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { deliveryOrderCode, attachment } = req.body;

            const existingOrder = await prisma.deliveryOrder.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingOrder) {
                return ResponseHelper.notFound(res, 'Delivery order not found');
            }

            // Check if new delivery order code conflicts with another order
            if (deliveryOrderCode && deliveryOrderCode !== existingOrder.deliveryOrderCode) {
                const conflictOrder = await prisma.deliveryOrder.findUnique({
                    where: { deliveryOrderCode },
                });
                if (conflictOrder && conflictOrder.id !== id) {
                    return ResponseHelper.badRequest(res, 'Delivery order code already exists');
                }
            }

            const deliveryOrder = await prisma.deliveryOrder.update({
                where: { id },
                data: { deliveryOrderCode, attachment },
            });

            return ResponseHelper.success(res, deliveryOrder, 'Delivery order updated successfully');
        } catch (error) {
            console.error('Error updating delivery order:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Delivery order code already exists');
            }
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
