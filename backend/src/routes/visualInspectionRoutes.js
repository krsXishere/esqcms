const express = require('express');
const router = express.Router();
const visualInspectionController = require('../controllers/visualInspectionController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkVisualInspectionOwnership } = require('../middleware/ownershipMiddleware');
const { cannotEditApproved } = require('../middleware/statusMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /visual-inspections:
 *   get:
 *     summary: Get all visual inspections
 *     description: Retrieve all visual inspections
 *     tags: [Visual Inspections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visual inspections retrieved successfully
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
 *                     $ref: '#/components/schemas/VisualInspection'
 */
router.get('/', (req, res) => visualInspectionController.getAll(req, res));

/**
 * @swagger
 * /visual-inspections/{id}:
 *   get:
 *     summary: Get visual inspection by ID
 *     description: Retrieve a visual inspection by ID
 *     tags: [Visual Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Visual Inspection ID
 *     responses:
 *       200:
 *         description: Visual inspection retrieved successfully
 *       404:
 *         description: Visual inspection not found
 */
router.get('/:id', (req, res) => visualInspectionController.getById(req, res));

/**
 * @swagger
 * /visual-inspections:
 *   post:
 *     summary: Create new visual inspection
 *     description: Create a new visual inspection (FI owner only)
 *     tags: [Visual Inspections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisualInspectionInput'
 *     responses:
 *       201:
 *         description: Visual inspection created successfully
 *       403:
 *         description: Forbidden - Not FI owner or FI is approved
 */
router.post('/', checkVisualInspectionOwnership, cannotEditApproved, (req, res) => visualInspectionController.create(req, res));

/**
 * @swagger
 * /visual-inspections/{id}:
 *   put:
 *     summary: Update visual inspection
 *     description: Update a visual inspection by ID (FI owner only, cannot edit if approved)
 *     tags: [Visual Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Visual Inspection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisualInspectionInput'
 *     responses:
 *       200:
 *         description: Visual inspection updated successfully
 *       403:
 *         description: Forbidden - Not owner or FI is approved
 *       404:
 *         description: Visual inspection not found
 */
router.put('/:id', checkVisualInspectionOwnership, cannotEditApproved, (req, res) => visualInspectionController.update(req, res));

/**
 * @swagger
 * /visual-inspections/{id}:
 *   delete:
 *     summary: Delete visual inspection
 *     description: Soft delete a visual inspection (FI owner only, cannot delete if approved)
 *     tags: [Visual Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Visual Inspection ID
 *     responses:
 *       200:
 *         description: Visual inspection deleted successfully
 *       403:
 *         description: Forbidden - Not owner or FI is approved
 *       404:
 *         description: Visual inspection not found
 */
router.delete('/:id', checkVisualInspectionOwnership, cannotEditApproved, (req, res) => visualInspectionController.delete(req, res));

module.exports = router;
