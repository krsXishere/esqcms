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
 *     description: Retrieve all checksheet templates
 *     tags: [Checksheet Templates]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/ChecksheetTemplate'
 */
router.get('/', (req, res) => checksheetTemplateController.getAll(req, res));

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
