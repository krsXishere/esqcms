const express = require('express');
const router = express.Router();
const deliveryOrderController = require('../controllers/deliveryOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const { canManageMasterData } = require('../middleware/roleMiddleware');
const { uploadDeliveryOrder } = require('../middleware/multerConfig');

router.use(authMiddleware);

/**
 * @swagger
 * /delivery-orders:
 *   get:
 *     summary: Get all delivery orders
 *     description: Retrieve all delivery orders
 *     tags: [Delivery Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery orders retrieved successfully
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
 *                     $ref: '#/components/schemas/DeliveryOrder'
 */
router.get('/', (req, res) => deliveryOrderController.getAll(req, res));

/**
 * @swagger
 * /delivery-orders/{id}:
 *   get:
 *     summary: Get delivery order by ID
 *     description: Retrieve a delivery order by ID
 *     tags: [Delivery Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Delivery Order ID
 *     responses:
 *       200:
 *         description: Delivery order retrieved successfully
 *       404:
 *         description: Delivery order not found
 */
router.get('/:id', (req, res) => deliveryOrderController.getById(req, res));

/**
 * @swagger
 * /delivery-orders:
 *   post:
 *     summary: Create new delivery order
 *     description: Create a new delivery order with auto-generated code and image attachment (Operator only)
 *     tags: [Delivery Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - attachment
 *             properties:
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP) - Max 5MB
 *     responses:
 *       201:
 *         description: Delivery order created successfully with auto-generated code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryOrder'
 *       400:
 *         description: Invalid file or missing file
 *       403:
 *         description: Forbidden - Operator role required
 */
router.post(
    '/',
    canManageMasterData,
    uploadDeliveryOrder.single('attachment'),
    (req, res) => deliveryOrderController.create(req, res)
);

/**
 * @swagger
 * /delivery-orders/{id}:
 *   put:
 *     summary: Update delivery order attachment
 *     description: Update delivery order attachment/image (Operator only)
 *     tags: [Delivery Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Delivery Order ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, GIF, WebP) - Max 5MB
 *     responses:
 *       200:
 *         description: Delivery order updated successfully
 *       404:
 *         description: Delivery order not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.put(
    '/:id',
    canManageMasterData,
    uploadDeliveryOrder.single('attachment'),
    (req, res) => deliveryOrderController.update(req, res)
);

/**
 * @swagger
 * /delivery-orders/{id}:
 *   delete:
 *     summary: Delete delivery order
 *     description: Soft delete a delivery order (Operator only)
 *     tags: [Delivery Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Delivery Order ID
 *     responses:
 *       200:
 *         description: Delivery order deleted successfully
 *       404:
 *         description: Delivery order not found
 *       403:
 *         description: Forbidden - Operator role required
 */
router.delete('/:id', canManageMasterData, (req, res) => deliveryOrderController.delete(req, res));

module.exports = router;
