const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const plantaController = require('../controllers/plantaController');

// Sin token: la usa el firmware (Arduino no maneja JWT). Va antes del
// router.use(authMiddleware) a propósito, para que quede fuera de esa capa.
router.get('/dispositivo/:dispositivoId', plantaController.obtenerUmbralPorDispositivo);

// De aquí en adelante, todas las rutas requieren token
router.use(authMiddleware);

router.post('/', plantaController.crearPlanta);
router.get('/', plantaController.obtenerPlantas);
router.get('/:id', plantaController.obtenerPlanta);
router.patch('/:id', plantaController.actualizarPlanta);
router.delete('/:id', plantaController.eliminarPlanta);

module.exports = router;