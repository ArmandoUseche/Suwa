const mongoose = require('mongoose');

const alertaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['falla_sistema', 'nivel_agua_bajo', 'lectura_anomala'],
    required: true,
  },
  mensaje: { type: String, required: true },
  dispositivoId: { type: String, required: true },
  leida: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alerta', alertaSchema);
