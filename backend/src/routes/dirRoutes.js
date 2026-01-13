const express = require('express');
const router = express.Router();
const dirController = require('../controllers/dirController');
const authMiddleware = require('../middleware/authMiddleware');
const { canCreateChecksheet, canApproveChecksheet } = require('../middleware/roleMiddleware');
const { checkDirOwnership } = require('../middleware/ownershipMiddleware');
const { cannotEditApproved, cannotDowngradeStatus } = require('../middleware/statusMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /dirs:
 *   get:
 *     summary: Get all DIRs
 *     description: Retrieve all Dimensional Inspection Reports
 *     tags: [DIRs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: DIRs retrieved successfully
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
 *                     $ref: '#/components/schemas/Dir'
 */
router.get('/', (req, res) => dirController.getAll(req, res));

/**
 * @swagger
 * /dirs/{id}:
 *   get:
 *     summary: Get DIR by ID
 *     description: Retrieve a DIR by ID
 *     tags: [DIRs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     responses:
 *       200:
 *         description: DIR retrieved successfully
 *       404:
 *         description: DIR not found
 */
router.get('/:id', (req, res) => dirController.getById(req, res));

/**
 * @swagger
 * /dirs:
 *   post:
 *     summary: Create new DIR
 *     description: Create a new DIR (Inspector only)
 *     tags: [DIRs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirInput'
 *     responses:
 *       201:
 *         description: DIR created successfully
 *       403:
 *         description: Forbidden - Inspector role required
 */
router.post('/', canCreateChecksheet, (req, res) => dirController.create(req, res));

/**
 * @swagger
 * /dirs/{id}:
 *   put:
 *     summary: Update DIR
 *     description: Update a DIR by ID (Owner only, cannot edit if approved)
 *     tags: [DIRs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DirInput'
 *     responses:
 *       200:
 *         description: DIR updated successfully
 *       403:
 *         description: Forbidden - Not owner or DIR is approved
 *       404:
 *         description: DIR not found
 */
router.put('/:id', checkDirOwnership, cannotEditApproved, cannotDowngradeStatus, (req, res) => dirController.update(req, res));

/**
 * @swagger
 * /dirs/{id}/status:
 *   patch:
 *     summary: Update DIR status
 *     description: Update DIR status (Supervisor/Operator only for approval)
 *     tags: [DIRs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
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
 *         description: DIR status updated successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 *       404:
 *         description: DIR not found
 */
router.patch('/:id/status', canApproveChecksheet, (req, res) => dirController.updateStatus(req, res));

/**
 * @swagger
 * /dirs/{id}:
 *   delete:
 *     summary: Delete DIR
 *     description: Soft delete a DIR (Owner only, cannot delete if approved)
 *     tags: [DIRs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: DIR ID
 *     responses:
 *       200:
 *         description: DIR deleted successfully
 *       403:
 *         description: Forbidden - Not owner or DIR is approved
 *       404:
 *         description: DIR not found
 */
router.delete('/:id', checkDirOwnership, cannotEditApproved, (req, res) => dirController.delete(req, res));

module.exports = router;
