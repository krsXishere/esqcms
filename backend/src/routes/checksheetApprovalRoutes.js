const express = require('express');
const router = express.Router();
const checksheetApprovalController = require('../controllers/checksheetApprovalController');
const authMiddleware = require('../middleware/authMiddleware');
const { canApproveChecksheet } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /checksheet-approvals:
 *   get:
 *     summary: Get all checksheet approvals
 *     description: Retrieve all checksheet approvals
 *     tags: [Checksheet Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checksheet approvals retrieved successfully
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
 *                     $ref: '#/components/schemas/ChecksheetApproval'
 */
router.get('/', (req, res) => checksheetApprovalController.getAll(req, res));

/**
 * @swagger
 * /checksheet-approvals/reference/{referenceType}/{referenceId}:
 *   get:
 *     summary: Get approvals by reference
 *     description: Retrieve all approvals for a specific DIR or FI
 *     tags: [Checksheet Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: referenceType
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ReferenceType'
 *         description: Reference type (dir or fi)
 *       - in: path
 *         name: referenceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reference ID
 *     responses:
 *       200:
 *         description: Checksheet approvals retrieved successfully
 */
router.get('/reference/:referenceType/:referenceId', (req, res) => checksheetApprovalController.getByReference(req, res));

/**
 * @swagger
 * /checksheet-approvals/{id}:
 *   get:
 *     summary: Get checksheet approval by ID
 *     description: Retrieve a checksheet approval by ID
 *     tags: [Checksheet Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Approval ID
 *     responses:
 *       200:
 *         description: Checksheet approval retrieved successfully
 *       404:
 *         description: Checksheet approval not found
 */
router.get('/:id', (req, res) => checksheetApprovalController.getById(req, res));

/**
 * @swagger
 * /checksheet-approvals:
 *   post:
 *     summary: Create new checksheet approval
 *     description: Create a new checksheet approval (Supervisor/Operator only)
 *     tags: [Checksheet Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChecksheetApprovalInput'
 *     responses:
 *       201:
 *         description: Checksheet approval created successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 */
router.post('/', canApproveChecksheet, (req, res) => checksheetApprovalController.create(req, res));

/**
 * @swagger
 * /checksheet-approvals/{id}:
 *   put:
 *     summary: Update checksheet approval
 *     description: Update a checksheet approval by ID (Supervisor/Operator only)
 *     tags: [Checksheet Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Approval ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChecksheetApprovalInput'
 *     responses:
 *       200:
 *         description: Checksheet approval updated successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 *       404:
 *         description: Checksheet approval not found
 */
router.put('/:id', canApproveChecksheet, (req, res) => checksheetApprovalController.update(req, res));

/**
 * @swagger
 * /checksheet-approvals/{id}:
 *   delete:
 *     summary: Delete checksheet approval
 *     description: Soft delete a checksheet approval (Supervisor/Operator only)
 *     tags: [Checksheet Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Approval ID
 *     responses:
 *       200:
 *         description: Checksheet approval deleted successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 *       404:
 *         description: Checksheet approval not found
 */
router.delete('/:id', canApproveChecksheet, (req, res) => checksheetApprovalController.delete(req, res));

module.exports = router;
