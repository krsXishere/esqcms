const prisma = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const fileUploadHelper = require('../utils/fileUploadHelper');
const fs = require('fs');
const path = require('path');

class DrawingController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '', modelId = '', partId = '' } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const where = {
                deletedAt: null,
                ...(modelId && { modelId }),
                ...(partId && { partId }),
                ...(search && {
                    OR: [
                        { fileName: { contains: search, mode: 'insensitive' } },
                        { version: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            };

            const [drawings, total] = await Promise.all([
                prisma.drawing.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        model: true,
                        part: true,
                    },
                }),
                prisma.drawing.count({ where }),
            ]);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            };

            return ResponseHelper.paginate(res, drawings, pagination, 'Drawings retrieved successfully');
        } catch (error) {
            console.error('Error fetching drawings:', error);
            return ResponseHelper.error(res, 'Failed to fetch drawings');
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;

            const drawing = await prisma.drawing.findFirst({
                where: { id, deletedAt: null },
                include: {
                    model: true,
                    part: true,
                },
            });

            if (!drawing) {
                return ResponseHelper.notFound(res, 'Drawing not found');
            }

            return ResponseHelper.success(res, drawing, 'Drawing retrieved successfully');
        } catch (error) {
            console.error('Error fetching drawing:', error);
            return ResponseHelper.error(res, 'Failed to fetch drawing');
        }
    }

    async create(req, res) {
        try {
            const { modelId, partId, version } = req.body;
            const file = req.file;

            if (!modelId || !partId || !version) {
                return ResponseHelper.badRequest(res, 'Model ID, Part ID, and version are required');
            }

            if (!file) {
                return ResponseHelper.badRequest(res, 'Drawing file is required');
            }

            // Validate file
            const validation = fileUploadHelper.validateImageFile(file);
            if (!validation.isValid) {
                return ResponseHelper.badRequest(res, validation.error);
            }

            // Get extension and generate safe filename
            const extension = fileUploadHelper.getExtensionFromMimeType(file.mimetype);
            const safeFileName = fileUploadHelper.generateSafeFilename(file.originalname, extension);

            // Get upload directory and ensure it exists
            const uploadDir = fileUploadHelper.getDrawingUploadDir();
            fileUploadHelper.ensureDirectoryExists(uploadDir);

            // Write file to disk
            const filePath = path.join(uploadDir, safeFileName);
            try {
                fs.writeFileSync(filePath, file.buffer);
            } catch (writeError) {
                console.error('Error writing file to disk:', writeError);
                return ResponseHelper.error(res, 'Failed to save drawing file');
            }

            // Create drawing record
            const drawing = await prisma.drawing.create({
                data: {
                    modelId,
                    partId,
                    fileName: safeFileName,
                    filePath: fileUploadHelper.getDrawingFileUrl(safeFileName),
                    fileType: extension.toUpperCase(),
                    version,
                },
                include: {
                    model: true,
                    part: true,
                },
            });

            return ResponseHelper.created(res, drawing, 'Drawing created successfully');
        } catch (error) {
            console.error('Error creating drawing:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid model or part reference');
            }
            return ResponseHelper.error(res, 'Failed to create drawing');
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { modelId, partId, version } = req.body;
            const file = req.file;

            const existingDrawing = await prisma.drawing.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingDrawing) {
                return ResponseHelper.notFound(res, 'Drawing not found');
            }

            let updateData = {};
            if (modelId) updateData.modelId = modelId;
            if (partId) updateData.partId = partId;
            if (version) updateData.version = version;

            // Handle file update if provided
            if (file) {
                const validation = fileUploadHelper.validateImageFile(file);
                if (!validation.isValid) {
                    return ResponseHelper.badRequest(res, validation.error);
                }

                // Delete old file
                if (existingDrawing.fileName) {
                    const uploadDir = fileUploadHelper.getDrawingUploadDir();
                    const oldFileFullPath = path.join(uploadDir, existingDrawing.fileName);
                    try {
                        if (fs.existsSync(oldFileFullPath)) {
                            fs.unlinkSync(oldFileFullPath);
                        }
                    } catch (unlinkError) {
                        console.error('Error deleting old file:', unlinkError);
                    }
                }

                // Save new file
                const extension = fileUploadHelper.getExtensionFromMimeType(file.mimetype);
                const safeFileName = fileUploadHelper.generateSafeFilename(file.originalname, extension);
                const uploadDir = fileUploadHelper.getDrawingUploadDir();
                fileUploadHelper.ensureDirectoryExists(uploadDir);
                const filePath = path.join(uploadDir, safeFileName);

                try {
                    fs.writeFileSync(filePath, file.buffer);
                } catch (writeError) {
                    console.error('Error writing file to disk:', writeError);
                    return ResponseHelper.error(res, 'Failed to save drawing file');
                }

                updateData.fileName = safeFileName;
                updateData.filePath = fileUploadHelper.getDrawingFileUrl(safeFileName);
                updateData.fileType = extension.toUpperCase();
            }

            const drawing = await prisma.drawing.update({
                where: { id },
                data: updateData,
                include: {
                    model: true,
                    part: true,
                },
            });

            return ResponseHelper.success(res, drawing, 'Drawing updated successfully');
        } catch (error) {
            console.error('Error updating drawing:', error);
            if (error.code === 'P2003') {
                return ResponseHelper.badRequest(res, 'Invalid model or part reference');
            }
            return ResponseHelper.error(res, 'Failed to update drawing');
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingDrawing = await prisma.drawing.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingDrawing) {
                return ResponseHelper.notFound(res, 'Drawing not found');
            }

            // Delete file from disk
            if (existingDrawing.fileName) {
                const uploadDir = fileUploadHelper.getDrawingUploadDir();
                const filePath = path.join(uploadDir, existingDrawing.fileName);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (unlinkError) {
                    console.error('Error deleting file:', unlinkError);
                }
            }

            await prisma.drawing.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            return ResponseHelper.success(res, null, 'Drawing deleted successfully');
        } catch (error) {
            console.error('Error deleting drawing:', error);
            return ResponseHelper.error(res, 'Failed to delete drawing');
        }
    }
}

module.exports = new DrawingController();
