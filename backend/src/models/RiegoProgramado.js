const mongoose = require('mongoose');

const riegoProgramadoSchema = new mongoose.Schema({
  dispositivoId: { type: String, required: true, unique: true },
  hora: { type: Number, required: true, min: 0, max: 23 },
  minuto: { type: Number, required: true, min: 0, max: 59 },
  duracionSegundos: { type: Number, default: 10, min: 1, max: 120 },
  proximaEjecucion: { type: Date, required: true },
  activo: { type: Boolean, default: true },
  comandoPendiente: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('RiegoProgramado', riegoProgramadoSchema);
