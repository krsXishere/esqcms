const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');

// GET all types
router.get('/', (req, res) => typeController.getAll(req, res));

// GET type by ID
router.get('/:id', (req, res) => typeController.getById(req, res));

// POST create new type
router.post('/', (req, res) => typeController.create(req, res));

// PUT update type
router.put('/:id', (req, res) => typeController.update(req, res));

// DELETE type (soft delete)
router.delete('/:id', (req, res) => typeController.delete(req, res));

module.exports = router;
