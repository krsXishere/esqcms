const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /sections:
 *   get:
 *     summary: Get all sections
 *     description: Retrieve all sections
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
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
 *                     $ref: '#/components/schemas/Section'
 */
router.get('/', (req, res) => sectionController.getAll(req, res));

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     summary: Get section by ID
 *     description: Retrieve a section by ID
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *       404:
 *         description: Section not found
 */
router.get('/:id', (req, res) => sectionController.getById(req, res));

/**
 * @swagger
 * /sections:
 *   post:
 *     summary: Create new section
 *     description: Create a new section (Operator only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SectionInput'
 *     responses:
 *       201:
 *         description: Section created successfully
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post('/', canManageMasterData, (req, res) => sectionController.create(req, res));

/**
 * @swagger
 * /sections/{id}:
 *   put:
 *     summary: Update section
 *     description: Update a section by ID (Operator only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Section ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SectionInput'
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       404:
 *         description: Section not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put('/:id', canManageMasterData, (req, res) => sectionController.update(req, res));

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     summary: Delete section
 *     description: Soft delete a section (Operator only)
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section deleted successfully
 *       404:
 *         description: Section not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => sectionController.delete(req, res));

module.exports = router;
