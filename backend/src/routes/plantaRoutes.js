const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const plantaController = require('../controllers/plantaController');

// Todas las rutas requieren token
router.use(authMiddleware);

router.post('/', plantaController.crearPlanta);
router.get('/', plantaController.obtenerPlantas);
router.get('/:id', plantaController.obtenerPlanta);
router.patch('/:id', plantaController.actualizarPlanta);
router.delete('/:id', plantaController.eliminarPlanta);

module.exports = router;