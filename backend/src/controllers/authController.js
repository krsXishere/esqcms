const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return ResponseHelper.badRequest(res, 'Email and password are required');
            }

            // Find user by email
            const user = await prisma.user.findUnique({
                where: { email, deletedAt: null },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    password: true,
                    profilePicture: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            if (!user) {
                return ResponseHelper.badRequest(res, 'Invalid email or password');
            }

            // Verify password
            const isPasswordValid = await userService.comparePassword(password, user.password);
            if (!isPasswordValid) {
                return ResponseHelper.badRequest(res, 'Invalid email or password');
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            return ResponseHelper.success(
                res,
                {
                    user: userWithoutPassword,
                    token,
                },
                'Login successful'
            );
        } catch (error) {
            console.error('Error during login:', error);
            return ResponseHelper.error(res, 'Login failed');
        }
    }

    async me(req, res) {
        try {
            // Get user from token (will be set by auth middleware)
            const userId = req.user?.id;

            if (!userId) {
                return ResponseHelper.badRequest(res, 'User not authenticated');
            }

            const user = await prisma.user.findFirst({
                where: { id: userId, deletedAt: null },
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
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
}

module.exports = new AuthController();
