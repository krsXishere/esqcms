const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET all customers
router.get('/', (req, res) => customerController.getAll(req, res));

// GET customer by ID
router.get('/:id', (req, res) => customerController.getById(req, res));

// POST create new customer
router.post('/', (req, res) => customerController.create(req, res));

// PUT update customer
router.put('/:id', (req, res) => customerController.update(req, res));

// DELETE customer (soft delete)
router.delete('/:id', (req, res) => customerController.delete(req, res));

module.exports = router;
