const multer = require('multer');
const path = require('path');

/**
 * Multer configuration untuk file upload
 */

// Memory storage untuk memudahkan handling di controller
const storage = multer.memoryStorage();

// File filter untuk validasi tipe file
const fileFilter = (req, file, cb) => {
    // Allowed MIME types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Multer instance untuk delivery order upload
const uploadDeliveryOrder = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// File filter untuk drawing (support image dan PDF)
const drawingFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image and PDF files are allowed (JPEG, PNG, GIF, WebP, PDF)'), false);
    }
};

// Multer instance untuk drawing upload
const uploadDrawing = multer({
    storage,
    fileFilter: drawingFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// File filter untuk signature
const signatureFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Multer instance untuk signature upload
const uploadSignature = multer({
    storage,
    fileFilter: signatureFileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
});

// File filter untuk profile picture
const profilePictureFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Multer instance untuk profile picture upload
const uploadProfilePicture = multer({
    storage,
    fileFilter: profilePictureFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Combined file filter untuk user file uploads (profile picture atau signature)
const userFileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Multer instance untuk combined user file uploads
const uploadUserFiles = multer({
    storage,
    fileFilter: userFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Use highest limit (5MB) for both
    },
});

module.exports = {
    uploadDeliveryOrder,
    uploadDrawing,
    uploadSignature,
    uploadProfilePicture,
    uploadUserFiles,
};
