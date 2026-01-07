const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET all users
router.get('/', (req, res) => userController.getAll(req, res));

// GET user by ID
router.get('/:id', (req, res) => userController.getById(req, res));

// POST create new user
router.post('/', (req, res) => userController.create(req, res));

// PUT update user
router.put('/:id', (req, res) => userController.update(req, res));

// DELETE user (soft delete)
router.delete('/:id', (req, res) => userController.delete(req, res));

module.exports = router;
