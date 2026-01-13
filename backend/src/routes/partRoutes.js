const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /parts:
 *   get:
 *     summary: Get all parts
 *     description: Retrieve all parts
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parts retrieved successfully
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
 *                     $ref: '#/components/schemas/Part'
 */
router.get('/', (req, res) => partController.getAll(req, res));

/**
 * @swagger
 * /parts/{id}:
 *   get:
 *     summary: Get part by ID
 *     description: Retrieve a part by ID
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Part ID
 *     responses:
 *       200:
 *         description: Part retrieved successfully
 *       404:
 *         description: Part not found
 */
router.get('/:id', (req, res) => partController.getById(req, res));

/**
 * @swagger
 * /parts:
 *   post:
 *     summary: Create new part
 *     description: Create a new part (Operator only)
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartInput'
 *     responses:
 *       201:
 *         description: Part created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => partController.create(req, res));

/**
 * @swagger
 * /parts/{id}:
 *   put:
 *     summary: Update part
 *     description: Update a part by ID (Operator only)
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Part ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartInput'
 *     responses:
 *       200:
 *         description: Part updated successfully
 *       404:
 *         description: Part not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => partController.update(req, res));

/**
 * @swagger
 * /parts/{id}:
 *   delete:
 *     summary: Delete part
 *     description: Soft delete a part (Operator only)
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Part ID
 *     responses:
 *       200:
 *         description: Part deleted successfully
 *       404:
 *         description: Part not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => partController.delete(req, res));

module.exports = router;
