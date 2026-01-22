/**
 * Dashboard Routes
 * Role-based aggregated dashboard endpoints
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// All dashboard routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregated dashboard endpoints for different roles (READ ONLY)
 */

/**
 * @swagger
 * /dashboard/inspector:
 *   get:
 *     summary: Get Inspector Dashboard
 *     description: |
 *       Returns aggregated summary for inspector's own checksheets.
 *       Includes total counts, status breakdown, and recent activity.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inspector dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalChecksheets:
 *                           type: integer
 *                         totalDir:
 *                           type: integer
 *                         totalFi:
 *                           type: integer
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         dir:
 *                           type: object
 *                         fi:
 *                           type: object
 *                         pendingValidation:
 *                           type: integer
 *                         revisionReturned:
 *                           type: integer
 *                         approvedCount:
 *                           type: integer
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         dirs:
 *                           type: array
 *                         fis:
 *                           type: array
 *       403:
 *         description: Access denied - Inspector role required
 *       500:
 *         description: Server error
 */
router.get('/inspector', (req, res) => dashboardController.getInspectorDashboard(req, res));

/**
 * @swagger
 * /dashboard/checker:
 *   get:
 *     summary: Get Checker Dashboard
 *     description: |
 *       Returns pending/revision checksheets awaiting validation.
 *       For supervisors acting as checkers.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checker dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPending:
 *                           type: integer
 *                         totalRevision:
 *                           type: integer
 *                         totalChecked:
 *                           type: integer
 *                         totalApproved:
 *                           type: integer
 *                     metrics:
 *                       type: object
 *                     recentActivity:
 *                       type: object
 *       403:
 *         description: Access denied - Supervisor role required
 *       500:
 *         description: Server error
 */
router.get('/checker', (req, res) => dashboardController.getCheckerDashboard(req, res));

/**
 * @swagger
 * /dashboard/approver:
 *   get:
 *     summary: Get Approver Dashboard
 *     description: |
 *       Returns checked checksheets pending approval with quality metrics.
 *       Includes NG rate, after-repair rate, and top NG items.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approver dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalChecksheets:
 *                           type: integer
 *                         pendingApproval:
 *                           type: integer
 *                         approved:
 *                           type: integer
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         ngRate:
 *                           type: number
 *                         afterRepairRate:
 *                           type: number
 *                         topNgItems:
 *                           type: array
 *                     recentActivity:
 *                       type: object
 *       403:
 *         description: Access denied - Supervisor role required
 *       500:
 *         description: Server error
 */
router.get('/approver', (req, res) => dashboardController.getApproverDashboard(req, res));

/**
 * @swagger
 * /dashboard/operator:
 *   get:
 *     summary: Get Operator (Super Admin) Dashboard
 *     description: |
 *       Full system overview with comprehensive quality metrics.
 *       Optimized for frontend dashboard page with:
 *       - KPI cards (Total Checksheets, Pending Approval, Revision Needed, Completed Today)
 *       - Recent checksheets table (no, type, model, inspector, status, date)
 *       - Revision queue (no, model, inspector, reason, requestedBy, date, priority)
 *       - Quick stats (Pass Rate, On-Time Completion, Revision Rate)
 *       - System configuration status
 *       - Need attention list
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     kpiCards:
 *                       type: array
 *                       description: KPI cards for dashboard header
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Total Checksheets"
 *                           value:
 *                             type: integer
 *                             example: 1247
 *                           change:
 *                             type: string
 *                             example: "+12%"
 *                           trend:
 *                             type: string
 *                             enum: [up, down]
 *                           subtitle:
 *                             type: string
 *                             example: "This month"
 *                     recentChecksheets:
 *                       type: array
 *                       description: Recent checksheets for table display
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           no:
 *                             type: string
 *                             example: "DIR-2026-001"
 *                           type:
 *                             type: string
 *                             example: "In Process"
 *                           model:
 *                             type: string
 *                             example: "Pump XYZ-100"
 *                           inspector:
 *                             type: string
 *                             example: "John Doe"
 *                           status:
 *                             type: string
 *                             enum: [pending, checked, revision, approved]
 *                           date:
 *                             type: string
 *                             format: date
 *                     revisionQueue:
 *                       type: array
 *                       description: Items requiring revision
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           no:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [DIR, FI]
 *                           model:
 *                             type: string
 *                           inspector:
 *                             type: string
 *                           reason:
 *                             type: string
 *                             example: "Dimension out of tolerance"
 *                           requestedBy:
 *                             type: string
 *                           date:
 *                             type: string
 *                             format: date
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                     quickStats:
 *                       type: array
 *                       description: Quick performance statistics
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Pass Rate"
 *                           value:
 *                             type: integer
 *                             example: 94
 *                           color:
 *                             type: string
 *                             example: "#10B981"
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalChecksheets:
 *                           type: integer
 *                         totalDir:
 *                           type: integer
 *                         totalFi:
 *                           type: integer
 *                         pendingValidation:
 *                           type: integer
 *                         revisionNeeded:
 *                           type: integer
 *                         completedToday:
 *                           type: integer
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         overallNgRate:
 *                           type: number
 *                         qualityRiskIndicator:
 *                           type: string
 *                           enum: [LOW, MEDIUM, HIGH]
 *                         passRate:
 *                           type: integer
 *                         revisionRate:
 *                           type: integer
 *                         dirOverview:
 *                           type: object
 *                         fiOverview:
 *                           type: object
 *                     needAttention:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           model:
 *                             type: string
 *                           dirCode:
 *                             type: string
 *                           issueSummary:
 *                             type: string
 *                           severity:
 *                             type: string
 *                             enum: [LOW, MEDIUM, HIGH]
 *                     systemConfiguration:
 *                       type: object
 *                       properties:
 *                         templatesConfigured:
 *                           type: integer
 *                         drawingsUploaded:
 *                           type: integer
 *                         masterData:
 *                           type: object
 *                         completeness:
 *                           type: object
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         approvals:
 *                           type: array
 *       403:
 *         description: Access denied - Operator role required
 *       500:
 *         description: Server error
 */
router.get('/operator', (req, res) => dashboardController.getOperatorDashboard(req, res));

module.exports = router;
