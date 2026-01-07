const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

// GET all materials
router.get('/', (req, res) => materialController.getAll(req, res));

// GET material by ID
router.get('/:id', (req, res) => materialController.getById(req, res));

// POST create new material
router.post('/', (req, res) => materialController.create(req, res));

// PUT update material
router.put('/:id', (req, res) => materialController.update(req, res));

// DELETE material (soft delete)
router.delete('/:id', (req, res) => materialController.delete(req, res));

module.exports = router;
