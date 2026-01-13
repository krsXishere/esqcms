const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /materials:
 *   get:
 *     summary: Get all materials
 *     description: Retrieve all materials
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Materials retrieved successfully
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
 *                     $ref: '#/components/schemas/Material'
 */
router.get('/', (req, res) => materialController.getAll(req, res));

/**
 * @swagger
 * /materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     description: Retrieve a material by ID
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material retrieved successfully
 *       404:
 *         description: Material not found
 */
router.get('/:id', (req, res) => materialController.getById(req, res));

/**
 * @swagger
 * /materials:
 *   post:
 *     summary: Create new material
 *     description: Create a new material (Operator only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialInput'
 *     responses:
 *       201:
 *         description: Material created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => materialController.create(req, res));

/**
 * @swagger
 * /materials/{id}:
 *   put:
 *     summary: Update material
 *     description: Update a material by ID (Operator only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MaterialInput'
 *     responses:
 *       200:
 *         description: Material updated successfully
 *       404:
 *         description: Material not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => materialController.update(req, res));

/**
 * @swagger
 * /materials/{id}:
 *   delete:
 *     summary: Delete material
 *     description: Soft delete a material (Operator only)
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
 *       404:
 *         description: Material not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => materialController.delete(req, res));

module.exports = router;
