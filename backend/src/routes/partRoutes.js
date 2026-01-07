const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');

// GET all parts
router.get('/', (req, res) => partController.getAll(req, res));

// GET part by ID
router.get('/:id', (req, res) => partController.getById(req, res));

// POST create new part
router.post('/', (req, res) => partController.create(req, res));

// PUT update part
router.put('/:id', (req, res) => partController.update(req, res));

// DELETE part (soft delete)
router.delete('/:id', (req, res) => partController.delete(req, res));

module.exports = router;
