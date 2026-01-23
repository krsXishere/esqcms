const express = require('express');
const router = express.Router();
const checksheetTemplateController = require('../controllers/checksheetTemplateController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /checksheet-templates:
 *   get:
 *     summary: Get all checksheet templates
 *     description: Retrieve all checksheet templates with filtering and pagination
 *     tags: [Checksheet Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by template code or name
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [dir, fi]
 *         description: Filter by template type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, draft, inactive]
 *         description: Filter by template status
 *       - in: query
 *         name: modelId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by model ID
 *     responses:
 *       200:
 *         description: Checksheet templates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [In Process, Final]
 *                       fields:
 *                         type: integer
 *                       lastModified:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, draft, inactive]
 *                 pagination:
 *                   type: object
 */
router.get('/', (req, res) => checksheetTemplateController.getAll(req, res));

/**
 * @swagger
 * /checksheet-templates/stats:
 *   get:
 *     summary: Get template statistics
 *     description: Get counts of templates by status for dashboard stats cards
 *     tags: [Checksheet Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Template stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total templates count
 *                     active:
 *                       type: integer
 *                       description: Active templates count
 *                     draft:
 *                       type: integer
 *                       description: Draft templates count
 *                     inactive:
 *                       type: integer
 *                       description: Inactive templates count
 */
router.get('/stats', (req, res) => checksheetTemplateController.getStats(req, res));

/**
 * @swagger
 * /checksheet-templates/{id}:
 *   get:
 *     summary: Get checksheet template by ID
 *     description: Retrieve a checksheet template by ID
 *     tags: [Checksheet Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Template ID
 *     responses:
 *       200:
 *         description: Checksheet template retrieved successfully
 *       404:
 *         description: Checksheet template not found
 */
router.get('/:id', (req, res) => checksheetTemplateController.getById(req, res));

/**
 * @swagger
 * /checksheet-templates:
 *   post:
 *     summary: Create new checksheet template
 *     description: Create a new checksheet template (Operator only)
 *     tags: [Checksheet Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChecksheetTemplateInput'
 *     responses:
 *       201:
 *         description: Checksheet template created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => checksheetTemplateController.create(req, res));

/**
 * @swagger
 * /checksheet-templates/{id}:
 *   put:
 *     summary: Update checksheet template
 *     description: Update a checksheet template by ID (Operator only)
 *     tags: [Checksheet Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChecksheetTemplateInput'
 *     responses:
 *       200:
 *         description: Checksheet template updated successfully
 *       404:
 *         description: Checksheet template not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => checksheetTemplateController.update(req, res));

/**
 * @swagger
 * /checksheet-templates/{id}:
 *   delete:
 *     summary: Delete checksheet template
 *     description: Soft delete a checksheet template (Operator only)
 *     tags: [Checksheet Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Template ID
 *     responses:
 *       200:
 *         description: Checksheet template deleted successfully
 *       404:
 *         description: Checksheet template not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => checksheetTemplateController.delete(req, res));

module.exports = router;
