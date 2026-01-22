const express = require('express');
const router = express.Router();
const checksheetRevisionController = require('../controllers/checksheetRevisionController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /checksheet-revisions/current:
 *   get:
 *     summary: Get current revisions
 *     description: Get all DIRs/FIs currently in revision status with filter options
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by checksheet number or drawing number
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *         description: Filter by priority
 *       - in: query
 *         name: inspector
 *         schema:
 *           type: string
 *         description: Filter by inspector name
 *       - in: query
 *         name: requestedBy
 *         schema:
 *           type: string
 *         description: Filter by who requested the revision
 *       - in: query
 *         name: referenceType
 *         schema:
 *           type: string
 *           enum: [dir, fi]
 *         description: Filter by checksheet type
 *     responses:
 *       200:
 *         description: Current revisions retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       no:
 *                         type: string
 *                       type:
 *                         type: string
 *                       model:
 *                         type: string
 *                       inspector:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       requestedBy:
 *                         type: string
 *                       status:
 *                         type: string
 *                       date:
 *                         type: string
 *                       priority:
 *                         type: string
 *                 pagination:
 *                   type: object
 */
router.get('/current', (req, res) => checksheetRevisionController.getCurrentRevisions(req, res));

/**
 * @swagger
 * /checksheet-revisions/history:
 *   get:
 *     summary: Get revision history
 *     description: Get history of completed revisions (approved/checked checksheets)
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by checksheet number, model, or inspector
 *       - in: query
 *         name: referenceType
 *         schema:
 *           type: string
 *           enum: [dir, fi]
 *         description: Filter by checksheet type
 *     responses:
 *       200:
 *         description: Revision history retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       no:
 *                         type: string
 *                       type:
 *                         type: string
 *                       model:
 *                         type: string
 *                       inspector:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       requestedBy:
 *                         type: string
 *                       revisedAt:
 *                         type: string
 *                       completedAt:
 *                         type: string
 *                       duration:
 *                         type: string
 *                 pagination:
 *                   type: object
 */
router.get('/history', (req, res) => checksheetRevisionController.getRevisionHistory(req, res));

/**
 * @swagger
 * /checksheet-revisions:
 *   get:
 *     summary: Get all checksheet revisions
 *     description: Retrieve all checksheet revisions
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checksheet revisions retrieved successfully
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
 *                     $ref: '#/components/schemas/ChecksheetRevision'
 */
router.get('/', (req, res) => checksheetRevisionController.getAll(req, res));

/**
 * @swagger
 * /checksheet-revisions/reference/{referenceType}/{referenceId}:
 *   get:
 *     summary: Get revisions by reference
 *     description: Retrieve all revisions for a specific DIR or FI
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: referenceType
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/ReferenceType'
 *         description: Reference type (dir or fi)
 *       - in: path
 *         name: referenceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reference ID
 *     responses:
 *       200:
 *         description: Checksheet revisions retrieved successfully
 */
router.get('/reference/:referenceType/:referenceId', (req, res) => checksheetRevisionController.getByReference(req, res));

/**
 * @swagger
 * /checksheet-revisions/{id}:
 *   get:
 *     summary: Get checksheet revision by ID
 *     description: Retrieve a checksheet revision by ID
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Revision ID
 *     responses:
 *       200:
 *         description: Checksheet revision retrieved successfully
 *       404:
 *         description: Checksheet revision not found
 */
router.get('/:id', (req, res) => checksheetRevisionController.getById(req, res));

/**
 * @swagger
 * /checksheet-revisions:
 *   post:
 *     summary: Create new checksheet revision
 *     description: Create a new checksheet revision (Supervisor/Operator only)
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChecksheetRevisionInput'
 *     responses:
 *       201:
 *         description: Checksheet revision created successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 */
router.post('/', checkRole(['supervisor', 'operator']), (req, res) => checksheetRevisionController.create(req, res));

/**
 * @swagger
 * /checksheet-revisions/{id}:
 *   put:
 *     summary: Update checksheet revision
 *     description: Update a checksheet revision by ID (Supervisor/Operator only)
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Revision ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChecksheetRevisionInput'
 *     responses:
 *       200:
 *         description: Checksheet revision updated successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 *       404:
 *         description: Checksheet revision not found
 */
router.put('/:id', checkRole(['supervisor', 'operator']), (req, res) => checksheetRevisionController.update(req, res));

/**
 * @swagger
 * /checksheet-revisions/{id}:
 *   delete:
 *     summary: Delete checksheet revision
 *     description: Soft delete a checksheet revision (Supervisor/Operator only)
 *     tags: [Checksheet Revisions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Checksheet Revision ID
 *     responses:
 *       200:
 *         description: Checksheet revision deleted successfully
 *       403:
 *         description: Forbidden - Supervisor/Operator role required
 *       404:
 *         description: Checksheet revision not found
 */
router.delete('/:id', checkRole(['supervisor', 'operator']), (req, res) => checksheetRevisionController.delete(req, res));

module.exports = router;
