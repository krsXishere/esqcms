const express = require('express');
const router = express.Router();
const rejectReasonController = require('../controllers/rejectReasonController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /reject-reasons:
 *   get:
 *     summary: Get all reject reasons
 *     description: Retrieve all reject reasons
 *     tags: [Reject Reasons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reject reasons retrieved successfully
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
 *                     $ref: '#/components/schemas/RejectReason'
 */
router.get('/', (req, res) => rejectReasonController.getAll(req, res));

/**
 * @swagger
 * /reject-reasons/{id}:
 *   get:
 *     summary: Get reject reason by ID
 *     description: Retrieve a reject reason by ID
 *     tags: [Reject Reasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reject Reason ID
 *     responses:
 *       200:
 *         description: Reject reason retrieved successfully
 *       404:
 *         description: Reject reason not found
 */
router.get('/:id', (req, res) => rejectReasonController.getById(req, res));

/**
 * @swagger
 * /reject-reasons:
 *   post:
 *     summary: Create new reject reason
 *     description: Create a new reject reason (Operator only)
 *     tags: [Reject Reasons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectReasonInput'
 *     responses:
 *       201:
 *         description: Reject reason created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => rejectReasonController.create(req, res));

/**
 * @swagger
 * /reject-reasons/{id}:
 *   put:
 *     summary: Update reject reason
 *     description: Update a reject reason by ID (Operator only)
 *     tags: [Reject Reasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reject Reason ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectReasonInput'
 *     responses:
 *       200:
 *         description: Reject reason updated successfully
 *       404:
 *         description: Reject reason not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => rejectReasonController.update(req, res));

/**
 * @swagger
 * /reject-reasons/{id}:
 *   delete:
 *     summary: Delete reject reason
 *     description: Soft delete a reject reason (Operator only)
 *     tags: [Reject Reasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reject Reason ID
 *     responses:
 *       200:
 *         description: Reject reason deleted successfully
 *       404:
 *         description: Reject reason not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => rejectReasonController.delete(req, res));

module.exports = router;
