const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkMeasurementOwnership } = require('../middleware/ownershipMiddleware');
const { cannotEditApproved } = require('../middleware/statusMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /measurements:
 *   get:
 *     summary: Get all measurements
 *     description: Retrieve all measurements
 *     tags: [Measurements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Measurements retrieved successfully
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
 *                     $ref: '#/components/schemas/Measurement'
 */
router.get('/', (req, res) => measurementController.getAll(req, res));

/**
 * @swagger
 * /measurements/{id}:
 *   get:
 *     summary: Get measurement by ID
 *     description: Retrieve a measurement by ID
 *     tags: [Measurements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Measurement ID
 *     responses:
 *       200:
 *         description: Measurement retrieved successfully
 *       404:
 *         description: Measurement not found
 */
router.get('/:id', (req, res) => measurementController.getById(req, res));

/**
 * @swagger
 * /measurements:
 *   post:
 *     summary: Create new measurement
 *     description: Create a new measurement (DIR owner only)
 *     tags: [Measurements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeasurementInput'
 *     responses:
 *       201:
 *         description: Measurement created successfully
 *       403:
 *         description: Forbidden - Not DIR owner or DIR is approved
 */
router.post('/', checkMeasurementOwnership, cannotEditApproved, (req, res) => measurementController.create(req, res));

/**
 * @swagger
 * /measurements/{id}:
 *   put:
 *     summary: Update measurement
 *     description: Update a measurement by ID (DIR owner only, cannot edit if approved)
 *     tags: [Measurements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Measurement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeasurementInput'
 *     responses:
 *       200:
 *         description: Measurement updated successfully
 *       403:
 *         description: Forbidden - Not owner or DIR is approved
 *       404:
 *         description: Measurement not found
 */
router.put('/:id', checkMeasurementOwnership, cannotEditApproved, (req, res) => measurementController.update(req, res));

/**
 * @swagger
 * /measurements/{id}:
 *   delete:
 *     summary: Delete measurement
 *     description: Soft delete a measurement (DIR owner only, cannot delete if approved)
 *     tags: [Measurements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Measurement ID
 *     responses:
 *       200:
 *         description: Measurement deleted successfully
 *       403:
 *         description: Forbidden - Not owner or DIR is approved
 *       404:
 *         description: Measurement not found
 */
router.delete('/:id', checkMeasurementOwnership, cannotEditApproved, (req, res) => measurementController.delete(req, res));

module.exports = router;
