const express = require('express');
const router = express.Router();
const drawingController = require('../controllers/drawingController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /drawings:
 *   get:
 *     summary: Get all drawings
 *     description: Retrieve all drawings
 *     tags: [Drawings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Drawings retrieved successfully
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
 *                     $ref: '#/components/schemas/Drawing'
 */
router.get('/', (req, res) => drawingController.getAll(req, res));

/**
 * @swagger
 * /drawings/{id}:
 *   get:
 *     summary: Get drawing by ID
 *     description: Retrieve a drawing by ID
 *     tags: [Drawings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Drawing ID
 *     responses:
 *       200:
 *         description: Drawing retrieved successfully
 *       404:
 *         description: Drawing not found
 */
router.get('/:id', (req, res) => drawingController.getById(req, res));

/**
 * @swagger
 * /drawings:
 *   post:
 *     summary: Create new drawing
 *     description: Create a new drawing (Operator only)
 *     tags: [Drawings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DrawingInput'
 *     responses:
 *       201:
 *         description: Drawing created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => drawingController.create(req, res));

/**
 * @swagger
 * /drawings/{id}:
 *   put:
 *     summary: Update drawing
 *     description: Update a drawing by ID (Operator only)
 *     tags: [Drawings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Drawing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DrawingInput'
 *     responses:
 *       200:
 *         description: Drawing updated successfully
 *       404:
 *         description: Drawing not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => drawingController.update(req, res));

/**
 * @swagger
 * /drawings/{id}:
 *   delete:
 *     summary: Delete drawing
 *     description: Soft delete a drawing (Operator only)
 *     tags: [Drawings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Drawing ID
 *     responses:
 *       200:
 *         description: Drawing deleted successfully
 *       404:
 *         description: Drawing not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => drawingController.delete(req, res));

module.exports = router;
