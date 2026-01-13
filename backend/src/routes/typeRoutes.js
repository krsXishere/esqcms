const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /types:
 *   get:
 *     summary: Get all types
 *     description: Retrieve all types
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Types retrieved successfully
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
 *                     $ref: '#/components/schemas/Type'
 */
router.get('/', (req, res) => typeController.getAll(req, res));

/**
 * @swagger
 * /types/{id}:
 *   get:
 *     summary: Get type by ID
 *     description: Retrieve a type by ID
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Type ID
 *     responses:
 *       200:
 *         description: Type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Type'
 *       404:
 *         description: Type not found
 */
router.get('/:id', (req, res) => typeController.getById(req, res));

/**
 * @swagger
 * /types:
 *   post:
 *     summary: Create new type
 *     description: Create a new type (Operator only)
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TypeInput'
 *     responses:
 *       201:
 *         description: Type created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => typeController.create(req, res));

/**
 * @swagger
 * /types/{id}:
 *   put:
 *     summary: Update type
 *     description: Update a type by ID (Operator only)
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TypeInput'
 *     responses:
 *       200:
 *         description: Type updated successfully
 *       404:
 *         description: Type not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => typeController.update(req, res));

/**
 * @swagger
 * /types/{id}:
 *   delete:
 *     summary: Delete type
 *     description: Soft delete a type (Operator only)
 *     tags: [Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Type ID
 *     responses:
 *       200:
 *         description: Type deleted successfully
 *       404:
 *         description: Type not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => typeController.delete(req, res));

module.exports = router;
