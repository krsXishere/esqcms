const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');

class CustomerController {
    /**
     * Get all customers with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    customerName: {
                        contains: search,
                        mode: 'insensitive',
                    },
                }),
            };

            const [customers, total] = await Promise.all([
                prisma.customer.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                prisma.customer.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, customers, pagination, 'Customers retrieved successfully');
        } catch (error) {
            console.error('Error fetching customers:', error);
            return ResponseHelper.error(res, 'Failed to fetch customers');
        }
    }

    /**
     * Get customer by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const customer = await prisma.customer.findFirst({
                where: { id, deletedAt: null },
            });

            if (!customer) {
                return ResponseHelper.notFound(res, 'Customer not found');
            }

            return ResponseHelper.success(res, customer, 'Customer retrieved successfully');
        } catch (error) {
            console.error('Error fetching customer:', error);
            return ResponseHelper.error(res, 'Failed to fetch customer');
        }
    }

    /**
     * Create new customer
     */
    async create(req, res) {
        try {
            const { customerName } = req.body;

            if (!customerName) {
                return ResponseHelper.badRequest(res, 'Customer name is required');
            }

            const customer = await prisma.customer.create({
                data: { customerName },
            });

            return ResponseHelper.created(res, customer, 'Customer created successfully');
        } catch (error) {
            console.error('Error creating customer:', error);
            return ResponseHelper.error(res, 'Failed to create customer');
        }
    }

    /**
     * Update customer
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { customerName } = req.body;

            const existingCustomer = await prisma.customer.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingCustomer) {
                return ResponseHelper.notFound(res, 'Customer not found');
            }

            const customer = await prisma.customer.update({
                where: { id },
                data: { customerName },
            });

            return ResponseHelper.success(res, customer, 'Customer updated successfully');
        } catch (error) {
            console.error('Error updating customer:', error);
            return ResponseHelper.error(res, 'Failed to update customer');
        }
    }

    /**
     * Soft delete customer
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingCustomer = await prisma.customer.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingCustomer) {
                return ResponseHelper.notFound(res, 'Customer not found');
            }

            await prisma.customer.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Customer deleted successfully');
        } catch (error) {
            console.error('Error deleting customer:', error);
            return ResponseHelper.error(res, 'Failed to delete customer');
        }
    }
}

module.exports = new CustomerController();
