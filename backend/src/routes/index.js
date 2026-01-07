const express = require('express');
const router = express.Router();

// Import all route modules
const typeRoutes = require('./typeRoutes');
const modelRoutes = require('./modelRoutes');
const partRoutes = require('./partRoutes');
const deliveryOrderRoutes = require('./deliveryOrderRoutes');
const materialRoutes = require('./materialRoutes');
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');

// Mount routes
router.use('/types', typeRoutes);
router.use('/models', modelRoutes);
router.use('/parts', partRoutes);
router.use('/delivery-orders', deliveryOrderRoutes);
router.use('/materials', materialRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

module.exports = router;
