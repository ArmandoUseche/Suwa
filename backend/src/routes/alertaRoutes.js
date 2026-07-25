const express = require('express');
const router = express.Router();
const alertaController = require('../controllers/alertaController');

// GET /api/alertas/:dispositivoId -> lista de alertas del dispositivo
router.get('/:dispositivoId', alertaController.obtenerAlertas);

// PATCH /api/alertas/:id/leida -> marcar alerta como leída desde la app
router.patch('/:id/leida', alertaController.marcarLeida);

module.exports = router;
