const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// POST /api/sensores  -> el ESP32/Arduino envía una lectura nueva
router.post('/', sensorController.registrarLectura);

// GET /api/sensores/:dispositivoId  -> historial de lecturas
router.get('/:dispositivoId', sensorController.obtenerHistorial);

// GET /api/sensores/:dispositivoId/ultima -> última lectura (para dashboard)
router.get('/:dispositivoId/ultima', sensorController.obtenerUltimaLectura);

module.exports = router;
