const mongoose = require('mongoose');

const eventoRiegoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['automatico', 'manual'], required: true },
  duracionSegundos: { type: Number },
  humedadInicial: { type: Number },
  dispositivoId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EventoRiego', eventoRiegoSchema);
