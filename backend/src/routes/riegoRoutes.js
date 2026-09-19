const express = require('express');
const router = express.Router();
const riegoController = require('../controllers/riegoController');

// POST /api/riego/activar -> el usuario activa el riego manualmente desde la app
router.post('/activar', riegoController.activarRiego);
router.post('/programado', riegoController.programarRiego);
router.get('/programado/:dispositivoId', riegoController.obtenerProgramacion);
router.delete('/programado/:dispositivoId', riegoController.cancelarProgramacion);

// GET /api/riego/comando-pendiente/:dispositivoId -> el firmware pregunta
// por polling si hay un riego manual pendiente para él (alternativa a
// escuchar el socket 'comando_riego', que el microcontrolador no puede
// implementar fácilmente).
router.get('/comando-pendiente/:dispositivoId', riegoController.consultarComandoPendiente);

// POST /api/riego/evento -> el firmware confirma que ejecutó un ciclo de riego
router.post('/evento', riegoController.registrarEvento);

// GET /api/riego/:dispositivoId/historial
router.get('/:dispositivoId/historial', riegoController.obtenerHistorial);

module.exports = router;