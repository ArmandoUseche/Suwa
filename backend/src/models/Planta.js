const mongoose = require('mongoose');

const plantaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  dispositivoId: { type: String, default: null },
  nombreComun: { type: String, required: true },
  nombreCientifico: { type: String, required: true },
  fotoUri: { type: String, default: null },
  luzIdeal: { type: String, default: null },
  temperaturaIdeal: { type: Number, default: null },
  umbralHumedadMinimo: { type: Number, default: 30 },
  enMonitoreo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Planta', plantaSchema);