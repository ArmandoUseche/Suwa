const express = require('express');
const router = express.Router();
const riegoController = require('../controllers/riegoController');

// POST /api/riego/activar -> el usuario activa el riego manualmente desde la app
router.post('/activar', riegoController.activarRiego);

// POST /api/riego/evento -> el firmware confirma que ejecutó un ciclo de riego
router.post('/evento', riegoController.registrarEvento);

// GET /api/riego/:dispositivoId/historial
router.get('/:dispositivoId/historial', riegoController.obtenerHistorial);

module.exports = router;
