const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const typeRoutes = require('./typeRoutes');
const modelRoutes = require('./modelRoutes');
const partRoutes = require('./partRoutes');
const deliveryOrderRoutes = require('./deliveryOrderRoutes');
const materialRoutes = require('./materialRoutes');
const userRoutes = require('./userRoutes');
const customerRoutes = require('./customerRoutes');
const sectionRoutes = require('./sectionRoutes');
const shiftRoutes = require('./shiftRoutes');
const rejectReasonRoutes = require('./rejectReasonRoutes');
const dirRoutes = require('./dirRoutes');
const measurementRoutes = require('./measurementRoutes');
const measurementPhotoRoutes = require('./measurementPhotoRoutes');
const fiRoutes = require('./fiRoutes');
const visualInspectionRoutes = require('./visualInspectionRoutes');
const drawingRoutes = require('./drawingRoutes');
const checksheetTemplateRoutes = require('./checksheetTemplateRoutes');
const templateItemRoutes = require('./templateItemRoutes');
const checksheetRevisionRoutes = require('./checksheetRevisionRoutes');
const checksheetApprovalRoutes = require('./checksheetApprovalRoutes');
const checksheetWorkflowRoutes = require('./checksheetWorkflowRoutes');
const checksheetMonitoringRoutes = require('./checksheetMonitoringRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/types', typeRoutes);
router.use('/models', modelRoutes);
router.use('/parts', partRoutes);
router.use('/delivery-orders', deliveryOrderRoutes);
router.use('/materials', materialRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/sections', sectionRoutes);
router.use('/shifts', shiftRoutes);
router.use('/reject-reasons', rejectReasonRoutes);
router.use('/dirs', dirRoutes);
router.use('/measurements', measurementRoutes);
router.use('/measurement-photos', measurementPhotoRoutes);
router.use('/fis', fiRoutes);
router.use('/visual-inspections', visualInspectionRoutes);
router.use('/drawings', drawingRoutes);
router.use('/checksheet-templates', checksheetTemplateRoutes);
router.use('/template-items', templateItemRoutes);
router.use('/checksheet-revisions', checksheetRevisionRoutes);
router.use('/checksheet-approvals', checksheetApprovalRoutes);
router.use('/checksheets/monitoring', checksheetMonitoringRoutes);

// Checksheet workflow routes (business flow endpoints)
router.use('/', checksheetWorkflowRoutes);

// Dashboard routes (aggregated data endpoints)
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

module.exports = router;
