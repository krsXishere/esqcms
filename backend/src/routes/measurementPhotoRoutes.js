const express = require('express');
const router = express.Router();
const measurementPhotoController = require('../controllers/measurementPhotoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /measurement-photos:
 *   get:
 *     summary: Get all measurement photos
 *     description: Retrieve all measurement photos
 *     tags: [Measurement Photos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Measurement photos retrieved successfully
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
 *                     $ref: '#/components/schemas/MeasurementPhoto'
 */
router.get('/', (req, res) => measurementPhotoController.getAll(req, res));

/**
 * @swagger
 * /measurement-photos/measurement/{measurementId}:
 *   get:
 *     summary: Get photos by measurement ID
 *     description: Retrieve all photos for a specific measurement
 *     tags: [Measurement Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: measurementId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Measurement ID
 *     responses:
 *       200:
 *         description: Measurement photos retrieved successfully
 */
router.get('/measurement/:measurementId', (req, res) => measurementPhotoController.getByMeasurementId(req, res));

/**
 * @swagger
 * /measurement-photos/{id}:
 *   get:
 *     summary: Get measurement photo by ID
 *     description: Retrieve a measurement photo by ID
 *     tags: [Measurement Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Measurement Photo ID
 *     responses:
 *       200:
 *         description: Measurement photo retrieved successfully
 *       404:
 *         description: Measurement photo not found
 */
router.get('/:id', (req, res) => measurementPhotoController.getById(req, res));

/**
 * @swagger
 * /measurement-photos:
 *   post:
 *     summary: Create new measurement photo
 *     description: Create a new measurement photo
 *     tags: [Measurement Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeasurementPhotoInput'
 *     responses:
 *       201:
 *         description: Measurement photo created successfully
 */
router.post('/', (req, res) => measurementPhotoController.create(req, res));

/**
 * @swagger
 * /measurement-photos/{id}:
 *   put:
 *     summary: Update measurement photo
 *     description: Update a measurement photo by ID
 *     tags: [Measurement Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Measurement Photo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MeasurementPhotoInput'
 *     responses:
 *       200:
 *         description: Measurement photo updated successfully
 *       404:
 *         description: Measurement photo not found
 */
router.put('/:id', (req, res) => measurementPhotoController.update(req, res));

/**
 * @swagger
 * /measurement-photos/{id}:
 *   delete:
 *     summary: Delete measurement photo
 *     description: Soft delete a measurement photo
 *     tags: [Measurement Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Measurement Photo ID
 *     responses:
 *       200:
 *         description: Measurement photo deleted successfully
 *       404:
 *         description: Measurement photo not found
 */
router.delete('/:id', (req, res) => measurementPhotoController.delete(req, res));

module.exports = router;
