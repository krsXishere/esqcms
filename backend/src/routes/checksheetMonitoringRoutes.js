const express = require('express');
const router = express.Router();
const checksheetMonitoringController = require('../controllers/checksheetMonitoringController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /checksheets/monitoring:
 *   get:
 *     summary: Get checksheets for monitoring
 *     description: Retrieve all DIRs and FIs for monitoring dashboard with filtering, pagination and sorting
 *     tags: [Checksheet Monitoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by checksheet ID or drawing number
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [dir, fi]
 *         description: Filter by checksheet type (dir=DIR, fi=FI)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, revision, checked, approved]
 *         description: Filter by checksheet status
 *       - in: query
 *         name: model_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by model ID
 *       - in: query
 *         name: part_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by part ID
 *       - in: query
 *         name: sort_field
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, status]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sort_dir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Checksheets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       checksheet_id:
 *                         type: string
 *                         description: DIR or FI ID
 *                       serial_number:
 *                         type: string
 *                         description: Drawing number
 *                       type:
 *                         type: string
 *                         enum: [dir, fi]
 *                       model_name:
 *                         type: string
 *                       part_name:
 *                         type: string
 *                       inspector_name:
 *                         type: string
 *                       foreman_name:
 *                         type: string
 *                       approver_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, revision, checked, approved]
 *                       final_result:
 *                         type: string
 *                         enum: [OK, NG]
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request or unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => checksheetMonitoringController.getMonitoring(req, res));

module.exports = router;
