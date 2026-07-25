const mongoose = require('mongoose');

const plantaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  dispositivoId: { type: String, required: true },
  umbralHumedadMinimo: { type: Number, default: 30 }, // %
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Planta', plantaSchema);
