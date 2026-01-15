const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const userService = require('../services/userService');
const fileUploadHelper = require('../utils/fileUploadHelper');
const fs = require('fs');
const path = require('path');

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
                        signature: true,
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
                    signature: true,
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
            const { role, fullName, email, password } = req.body;
            const files = req.files || [];

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

            // Handle profile picture file upload if provided
            let profilePictureUrl = null;
            if (files && files.length > 0) {
                const profilePictureFile = files.find(f => f.fieldname === 'profilePicture');

                if (profilePictureFile) {
                    const validation = fileUploadHelper.validateImageFile(profilePictureFile);
                    if (!validation.isValid) {
                        return ResponseHelper.badRequest(res, validation.error);
                    }

                    const extension = fileUploadHelper.getExtensionFromMimeType(profilePictureFile.mimetype);
                    const safeFileName = fileUploadHelper.generateSafeFilename(profilePictureFile.originalname, extension);
                    const uploadDir = fileUploadHelper.getProfilePictureUploadDir();
                    fileUploadHelper.ensureDirectoryExists(uploadDir);
                    const filePath = path.join(uploadDir, safeFileName);

                    try {
                        fs.writeFileSync(filePath, profilePictureFile.buffer);
                        profilePictureUrl = fileUploadHelper.getProfilePictureFileUrl(safeFileName);
                    } catch (writeError) {
                        console.error('Error writing profile picture file to disk:', writeError);
                        return ResponseHelper.error(res, 'Failed to save profile picture');
                    }
                }
            }

            // Hash password
            const hashedPassword = await userService.hashPassword(password);

            const user = await prisma.user.create({
                data: {
                    role,
                    fullName,
                    email,
                    password: hashedPassword,
                    profilePicture: profilePictureUrl,
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
            const { role, fullName, email, password } = req.body;
            const files = req.files || [];
            const uploadType = req.body.uploadType;

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
            };

            // Handle file uploads
            if (files && files.length > 0) {
                // Find profile picture or signature file
                const profilePictureFile = files.find(f => f.fieldname === 'profilePicture');
                const signatureFile = files.find(f => f.fieldname === 'signature');

                if (profilePictureFile) {
                    const validation = fileUploadHelper.validateImageFile(profilePictureFile);
                    if (!validation.isValid) {
                        return ResponseHelper.badRequest(res, validation.error);
                    }

                    // Delete old profile picture if exists
                    if (existingUser.profilePicture) {
                        const uploadDir = fileUploadHelper.getProfilePictureUploadDir();
                        const oldFilePath = path.join(uploadDir, path.basename(existingUser.profilePicture));
                        try {
                            if (fs.existsSync(oldFilePath)) {
                                fs.unlinkSync(oldFilePath);
                            }
                        } catch (unlinkError) {
                            console.error('Error deleting old profile picture:', unlinkError);
                        }
                    }

                    // Save new profile picture
                    const extension = fileUploadHelper.getExtensionFromMimeType(profilePictureFile.mimetype);
                    const safeFileName = fileUploadHelper.generateSafeFilename(profilePictureFile.originalname, extension);
                    const uploadDir = fileUploadHelper.getProfilePictureUploadDir();
                    fileUploadHelper.ensureDirectoryExists(uploadDir);
                    const filePath = path.join(uploadDir, safeFileName);

                    try {
                        fs.writeFileSync(filePath, profilePictureFile.buffer);
                        updateData.profilePicture = fileUploadHelper.getProfilePictureFileUrl(safeFileName);
                    } catch (writeError) {
                        console.error('Error writing profile picture file to disk:', writeError);
                        return ResponseHelper.error(res, 'Failed to save profile picture');
                    }
                }

                if (signatureFile) {
                    const validation = fileUploadHelper.validateImageFile(signatureFile);
                    if (!validation.isValid) {
                        return ResponseHelper.badRequest(res, validation.error);
                    }

                    // Delete old signature if exists
                    if (existingUser.signature) {
                        const uploadDir = fileUploadHelper.getUserSignatureUploadDir();
                        const oldFilePath = path.join(uploadDir, path.basename(existingUser.signature));
                        try {
                            if (fs.existsSync(oldFilePath)) {
                                fs.unlinkSync(oldFilePath);
                            }
                        } catch (unlinkError) {
                            console.error('Error deleting old signature:', unlinkError);
                        }
                    }

                    // Save new signature
                    const extension = fileUploadHelper.getExtensionFromMimeType(signatureFile.mimetype);
                    const safeFileName = fileUploadHelper.generateSafeFilename(signatureFile.originalname, extension);
                    const uploadDir = fileUploadHelper.getUserSignatureUploadDir();
                    fileUploadHelper.ensureDirectoryExists(uploadDir);
                    const filePath = path.join(uploadDir, safeFileName);

                    try {
                        fs.writeFileSync(filePath, signatureFile.buffer);
                        updateData.signature = fileUploadHelper.getUserSignatureFileUrl(safeFileName);
                    } catch (writeError) {
                        console.error('Error writing signature file to disk:', writeError);
                        return ResponseHelper.error(res, 'Failed to save signature file');
                    }
                }
            }

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
                    signature: true,
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
