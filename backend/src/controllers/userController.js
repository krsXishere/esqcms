const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const userService = require('../services/userService');

class UserController {
    /**
     * Get all users with pagination
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', role = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(search && {
                    OR: [
                        { fullName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(role && { role }),
            };

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        role: true,
                        fullName: true,
                        email: true,
                        profilePicture: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                }),
                prisma.user.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, users, pagination, 'Users retrieved successfully');
        } catch (error) {
            console.error('Error fetching users:', error);
            return ResponseHelper.error(res, 'Failed to fetch users');
        }
    }

    /**
     * Get user by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            const user = await prisma.user.findFirst({
                where: { id, deletedAt: null },
                select: {
                    id: true,
                    role: true,
                    fullName: true,
                    email: true,
                    profilePicture: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                return ResponseHelper.notFound(res, 'User not found');
            }

            return ResponseHelper.success(res, user, 'User retrieved successfully');
        } catch (error) {
            console.error('Error fetching user:', error);
            return ResponseHelper.error(res, 'Failed to fetch user');
        }
    }

    /**
     * Create new user
     */
    async create(req, res) {
        try {
            const { role, fullName, email, password, profilePicture } = req.body;

            // Validate required fields
            if (!role || !fullName || !email || !password) {
                return ResponseHelper.badRequest(res, 'Role, full name, email, and password are required');
            }

            // Validate role
            const validRoles = ['inspector', 'supervisor', 'operator'];
            if (!validRoles.includes(role)) {
                return ResponseHelper.badRequest(res, 'Invalid role. Must be inspector, supervisor, or operator');
            }

            // Check if email already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return ResponseHelper.badRequest(res, 'Email already exists');
            }

            // Hash password
            const hashedPassword = await userService.hashPassword(password);

            const user = await prisma.user.create({
                data: {
                    role,
                    fullName,
                    email,
                    password: hashedPassword,
                    profilePicture,
                },
                select: {
                    id: true,
                    role: true,
                    fullName: true,
                    email: true,
                    profilePicture: true,
                    createdAt: true,
                },
            });

            return ResponseHelper.created(res, user, 'User created successfully');
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Email already exists');
            }
            return ResponseHelper.error(res, 'Failed to create user');
        }
    }

    /**
     * Update user
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const { role, fullName, email, password, profilePicture } = req.body;

            const existingUser = await prisma.user.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingUser) {
                return ResponseHelper.notFound(res, 'User not found');
            }

            // Validate role if provided
            if (role) {
                const validRoles = ['inspector', 'supervisor', 'operator'];
                if (!validRoles.includes(role)) {
                    return ResponseHelper.badRequest(res, 'Invalid role. Must be inspector, supervisor, or operator');
                }
            }

            // Check if new email conflicts with another user
            if (email && email !== existingUser.email) {
                const conflictUser = await prisma.user.findUnique({
                    where: { email },
                });
                if (conflictUser && conflictUser.id !== id) {
                    return ResponseHelper.badRequest(res, 'Email already exists');
                }
            }

            // Prepare update data
            const updateData = {
                ...(role && { role }),
                ...(fullName && { fullName }),
                ...(email && { email }),
                ...(profilePicture !== undefined && { profilePicture }),
            };

            // Hash password if provided
            if (password) {
                updateData.password = await userService.hashPassword(password);
            }

            const user = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    role: true,
                    fullName: true,
                    email: true,
                    profilePicture: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            return ResponseHelper.success(res, user, 'User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            if (error.code === 'P2002') {
                return ResponseHelper.badRequest(res, 'Email already exists');
            }
            return ResponseHelper.error(res, 'Failed to update user');
        }
    }

    /**
     * Soft delete user
     */
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingUser = await prisma.user.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingUser) {
                return ResponseHelper.notFound(res, 'User not found');
            }

            await prisma.user.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            return ResponseHelper.error(res, 'Failed to delete user');
        }
    }
}

module.exports = new UserController();
