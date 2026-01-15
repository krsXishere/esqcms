const path = require('path');
const fs = require('fs');

/**
 * Utility function untuk handle file upload
 */
class FileUploadHelper {
    /**
     * Validate if file is image
     * @param {Object} file - Express file object from multer
     * @returns {Object} - { isValid, error }
     */
    validateImageFile(file) {
        if (!file) {
            return { isValid: false, error: 'No file provided' };
        }

        // Allowed image MIME types
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return { isValid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' };
        }

        // Max file size: 5MB
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxFileSize) {
            return { isValid: false, error: 'File size must not exceed 5MB' };
        }

        return { isValid: true };
    }

    /**
     * Get file extension from MIME type
     * @param {string} mimetype - MIME type
     * @returns {string} - File extension
     */
    getExtensionFromMimeType(mimetype) {
        const mimeToExt = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
        };
        return mimeToExt[mimetype] || 'jpg';
    }

    /**
     * Generate safe filename for uploaded file
     * @param {string} originalName - Original filename
     * @param {string} extension - File extension
     * @returns {string} - Safe filename
     */
    generateSafeFilename(originalName, extension) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const nameWithoutExt = originalName.replace(/\.[^.]+$/, '');
        const safeName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        return `${safeName}-${timestamp}-${random}.${extension}`;
    }

    /**
     * Ensure upload directory exists
     * @param {string} dirPath - Directory path
     */
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * Get upload directory path for delivery orders
     * @returns {string} - Directory path
     */
    getDeliveryOrderUploadDir() {
        return path.join(process.cwd(), 'uploads', 'delivery-orders');
    }

    /**
     * Get public URL for uploaded file
     * @param {string} filename - Filename
     * @returns {string} - Public URL
     */
    getDeliveryOrderFileUrl(filename) {
        return `/uploads/delivery-orders/${filename}`;
    }

    /**
     * Get upload directory path for drawings
     * @returns {string} - Directory path
     */
    getDrawingUploadDir() {
        return path.join(process.cwd(), 'uploads', 'drawings');
    }

    /**
     * Get public URL for drawing file
     * @param {string} filename - Filename
     * @returns {string} - Public URL
     */
    getDrawingFileUrl(filename) {
        return `/uploads/drawings/${filename}`;
    }

    /**
     * Get upload directory path for user signatures
     * @returns {string} - Directory path
     */
    getUserSignatureUploadDir() {
        return path.join(process.cwd(), 'uploads', 'signatures');
    }

    /**
     * Get public URL for user signature file
     * @param {string} filename - Filename
     * @returns {string} - Public URL
     */
    getUserSignatureFileUrl(filename) {
        return `/uploads/signatures/${filename}`;
    }

    /**
     * Get upload directory path for user profile pictures
     * @returns {string} - Directory path
     */
    getProfilePictureUploadDir() {
        return path.join(process.cwd(), 'uploads', 'profile-pictures');
    }

    /**
     * Get public URL for user profile picture file
     * @param {string} filename - Filename
     * @returns {string} - Public URL
     */
    getProfilePictureFileUrl(filename) {
        return `/uploads/profile-pictures/${filename}`;
    }
}

module.exports = new FileUploadHelper();
