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
router.patch('/perfil', authMiddleware, authController.actualizarPerfil);

// POST /api/auth/olvide-contrasena
router.post('/olvide-contrasena', authController.olvidoContrasena);

// POST /api/auth/verificar-codigo
router.post('/verificar-codigo', authController.verificarCodigo);

// POST /api/auth/nueva-contrasena
router.post('/nueva-contrasena', authController.nuevaContrasena);

module.exports = router;