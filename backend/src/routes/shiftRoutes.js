const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Get all shifts
 *     description: Retrieve all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shifts retrieved successfully
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
 *                     $ref: '#/components/schemas/Shift'
 */
router.get('/', (req, res) => shiftController.getAll(req, res));

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Get shift by ID
 *     description: Retrieve a shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift retrieved successfully
 *       404:
 *         description: Shift not found
 */
router.get('/:id', (req, res) => shiftController.getById(req, res));

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Create new shift
 *     description: Create a new shift (Operator only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShiftInput'
 *     responses:
 *       201:
 *         description: Shift created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => shiftController.create(req, res));

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     summary: Update shift
 *     description: Update a shift by ID (Operator only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShiftInput'
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *       404:
 *         description: Shift not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => shiftController.update(req, res));

/**
 * @swagger
 * /shifts/{id}:
 *   delete:
 *     summary: Delete shift
 *     description: Soft delete a shift (Operator only)
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *       404:
 *         description: Shift not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => shiftController.delete(req, res));

module.exports = router;
