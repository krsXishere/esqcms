const express = require('express');
const router = express.Router();
const templateItemController = require('../controllers/templateItemController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /template-items:
 *   get:
 *     summary: Get all template items
 *     description: Retrieve all template items
 *     tags: [Template Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Template items retrieved successfully
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
 *                     $ref: '#/components/schemas/TemplateItem'
 */
router.get('/', (req, res) => templateItemController.getAll(req, res));

/**
 * @swagger
 * /template-items/template/{templateId}:
 *   get:
 *     summary: Get template items by template ID
 *     description: Retrieve all template items for a specific template
 *     tags: [Template Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template items retrieved successfully
 */
router.get('/template/:templateId', (req, res) => templateItemController.getByTemplateId(req, res));

/**
 * @swagger
 * /template-items/{id}:
 *   get:
 *     summary: Get template item by ID
 *     description: Retrieve a template item by ID
 *     tags: [Template Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template Item ID
 *     responses:
 *       200:
 *         description: Template item retrieved successfully
 *       404:
 *         description: Template item not found
 */
router.get('/:id', (req, res) => templateItemController.getById(req, res));

/**
 * @swagger
 * /template-items:
 *   post:
 *     summary: Create new template item
 *     description: Create a new template item (Operator only)
 *     tags: [Template Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateItemInput'
 *     responses:
 *       201:
 *         description: Template item created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => templateItemController.create(req, res));

/**
 * @swagger
 * /template-items/bulk:
 *   post:
 *     summary: Create multiple template items
 *     description: Create multiple template items at once (Operator only)
 *     tags: [Template Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TemplateItemInput'
 *     responses:
 *       201:
 *         description: Template items created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/bulk', canManageMasterData, (req, res) => templateItemController.createBulk(req, res));

/**
 * @swagger
 * /template-items/{id}:
 *   put:
 *     summary: Update template item
 *     description: Update a template item by ID (Operator only)
 *     tags: [Template Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateItemInput'
 *     responses:
 *       200:
 *         description: Template item updated successfully
 *       404:
 *         description: Template item not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => templateItemController.update(req, res));

/**
 * @swagger
 * /template-items/{id}:
 *   delete:
 *     summary: Delete template item
 *     description: Soft delete a template item (Operator only)
 *     tags: [Template Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Template Item ID
 *     responses:
 *       200:
 *         description: Template item deleted successfully
 *       404:
 *         description: Template item not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => templateItemController.delete(req, res));

module.exports = router;
