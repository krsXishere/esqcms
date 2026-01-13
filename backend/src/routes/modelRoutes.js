const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /models:
 *   get:
 *     summary: Get all models
 *     description: Retrieve all models
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Models retrieved successfully
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
 *                     $ref: '#/components/schemas/Model'
 */
router.get('/', (req, res) => modelController.getAll(req, res));

/**
 * @swagger
 * /models/{id}:
 *   get:
 *     summary: Get model by ID
 *     description: Retrieve a model by ID
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model retrieved successfully
 *       404:
 *         description: Model not found
 */
router.get('/:id', (req, res) => modelController.getById(req, res));

/**
 * @swagger
 * /models:
 *   post:
 *     summary: Create new model
 *     description: Create a new model (Operator only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModelInput'
 *     responses:
 *       201:
 *         description: Model created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => modelController.create(req, res));

/**
 * @swagger
 * /models/{id}:
 *   put:
 *     summary: Update model
 *     description: Update a model by ID (Operator only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModelInput'
 *     responses:
 *       200:
 *         description: Model updated successfully
 *       404:
 *         description: Model not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => modelController.update(req, res));

/**
 * @swagger
 * /models/{id}:
 *   delete:
 *     summary: Delete model
 *     description: Soft delete a model (Operator only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Model ID
 *     responses:
 *       200:
 *         description: Model deleted successfully
 *       404:
 *         description: Model not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => modelController.delete(req, res));

module.exports = router;
