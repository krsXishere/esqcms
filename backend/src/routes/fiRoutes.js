const express = require('express');
const router = express.Router();
const fiController = require('../controllers/fiController');
const authMiddleware = require('../middleware/authMiddleware');
const { canCreateChecksheet, canApproveChecksheet } = require('../middleware/roleMiddleware');
const { checkFiOwnership } = require('../middleware/ownershipMiddleware');
const { cannotEditApproved, cannotDowngradeStatus } = require('../middleware/statusMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /fis:
 *   get:
 *     summary: Get all FIs
 *     description: Retrieve all Final Inspections
 *     tags: [FIs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: FIs retrieved successfully
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
 *                     $ref: '#/components/schemas/Fi'
 */
router.get('/', (req, res) => fiController.getAll(req, res));

/**
 * @swagger
 * /fis/{id}:
 *   get:
 *     summary: Get FI by ID
 *     description: Retrieve a FI by ID
 *     tags: [FIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     responses:
 *       200:
 *         description: FI retrieved successfully
 *       404:
 *         description: FI not found
 */
router.get('/:id', (req, res) => fiController.getById(req, res));

/**
 * @swagger
 * /fis:
 *   post:
 *     summary: Create new FI
 *     description: Create a new FI (Inspector only)
 *     tags: [FIs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FiInput'
 *     responses:
 *       201:
 *         description: FI created successfully
 *       403:
 *         description: Forbidden - Inspector role required
 */
router.post('/', canCreateChecksheet, (req, res) => fiController.create(req, res));

/**
 * @swagger
 * /fis/{id}:
 *   put:
 *     summary: Update FI
 *     description: Update a FI by ID (Owner only, cannot edit if approved)
 *     tags: [FIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FiInput'
 *     responses:
 *       200:
 *         description: FI updated successfully
 *       403:
 *         description: Forbidden - Not owner or FI is approved
 *       404:
 *         description: FI not found
 */
router.put('/:id', checkFiOwnership, cannotEditApproved, cannotDowngradeStatus, (req, res) => fiController.update(req, res));

/**
 * @swagger
 * /fis/{id}/status:
 *   patch:
 *     summary: Update FI status
 *     description: Update FI status (Supervisor/Operator only for approval)
 *     tags: [FIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/DirStatus'
 *     responses:
 *       200:
 *         description: FI status updated successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 *       404:
 *         description: FI not found
 */
router.patch('/:id/status', canApproveChecksheet, (req, res) => fiController.updateStatus(req, res));

/**
 * @swagger
 * /fis/{id}:
 *   delete:
 *     summary: Delete FI
 *     description: Soft delete a FI (Owner only, cannot delete if approved)
 *     tags: [FIs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: FI ID
 *     responses:
 *       200:
 *         description: FI deleted successfully
 *       403:
 *         description: Forbidden - Not owner or FI is approved
 *       404:
 *         description: FI not found
 */
router.delete('/:id', checkFiOwnership, cannotEditApproved, (req, res) => fiController.delete(req, res));

module.exports = router;
