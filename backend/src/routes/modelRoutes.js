const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');

// GET all models
router.get('/', (req, res) => modelController.getAll(req, res));

// GET model by ID
router.get('/:id', (req, res) => modelController.getById(req, res));

// POST create new model
router.post('/', (req, res) => modelController.create(req, res));

// PUT update model
router.put('/:id', (req, res) => modelController.update(req, res));

// DELETE model (soft delete)
router.delete('/:id', (req, res) => modelController.delete(req, res));

module.exports = router;
