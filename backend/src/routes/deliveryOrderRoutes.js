const express = require('express');
const router = express.Router();
const deliveryOrderController = require('../controllers/deliveryOrderController');

// GET all delivery orders
router.get('/', (req, res) => deliveryOrderController.getAll(req, res));

// GET delivery order by ID
router.get('/:id', (req, res) => deliveryOrderController.getById(req, res));

// POST create new delivery order
router.post('/', (req, res) => deliveryOrderController.create(req, res));

// PUT update delivery order
router.put('/:id', (req, res) => deliveryOrderController.update(req, res));

// DELETE delivery order (soft delete)
router.delete('/:id', (req, res) => deliveryOrderController.delete(req, res));

module.exports = router;
