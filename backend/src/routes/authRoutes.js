const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/registro
router.post('/registro', authController.registro);

// POST /api/auth/login
router.post('/login', authController.login);

// PATCH /api/auth/cambiar-contrasena
router.patch('/cambiar-contrasena', authMiddleware, authController.cambiarContrasena);

module.exports = router;